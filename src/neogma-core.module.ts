import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { Neogma } from "neogma";
import { defer, lastValueFrom } from "rxjs";
import {
  NeogmaConfig,
  NeogmaModuleAsyncOptions,
  NeogmaModuleOptions,
  NeogmaOptionsFactory,
} from "./interfaces";
import { NEOGMA_MODULE_ID, NEOGMA_MODULE_OPTIONS } from "./neogma.constants";
import { coerceNumber, isTruthy } from "./shared";
import { getConnectionToken, handleRetry } from "./shared/neogma.utils";

@Global()
@Module({})
export class NeogmaCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(NEOGMA_MODULE_OPTIONS)
    private readonly options: NeogmaModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: NeogmaModuleOptions = {}): DynamicModule {
    const neogmaModuleOptionsProvider = {
      provide: NEOGMA_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider = {
      provide: getConnectionToken(options as NeogmaModuleOptions) as string,
      useFactory: async () => await this.createConnectionFactory(options),
    };

    return {
      module: NeogmaCoreModule,
      providers: [connectionProvider, neogmaModuleOptionsProvider],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(options: NeogmaModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options as NeogmaModuleOptions) as string,
      useFactory: async (neogmaOptions: NeogmaModuleOptions) => {
        if (options.name) {
          return await this.createConnectionFactory({
            ...neogmaOptions,
            name: options.name,
          });
        }
        return await this.createConnectionFactory(neogmaOptions);
      },
      inject: [NEOGMA_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: NeogmaCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        {
          provide: NEOGMA_MODULE_ID,
          useValue: randomUUID(),
        },
      ],
      exports: [connectionProvider],
    };
  }

  static fromEnv(options: NeogmaConfig | null = {}): DynamicModule {
    const name = options.name ? `_${options.name.toUpperCase()}` : "";
    const connectionProvider = {
      provide: getConnectionToken(options as NeogmaModuleOptions) as string,
      inject: [NEOGMA_MODULE_OPTIONS],
      useFactory: async (options: NeogmaModuleOptions) =>
        await this.createConnectionFactory(options),
    };
    const neogmaModuleOptionsProvider = {
      provide: NEOGMA_MODULE_OPTIONS,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...options,
        scheme: configService.get("NEO4J_SCHEME" + name),
        host: configService.get("NEO4J_HOST" + name),
        port: configService.get("NEO4J_PORT" + name),
        username: configService.get("NEO4J_USERNAME" + name),
        password: configService.get("NEO4J_PASSWORD" + name),
        database: configService.get("NEO4J_DATABASE" + name),
        config: {
          encrypted: configService.get("NEO4J_ENCRYPTION_LEVEL" + name),
          trust: configService.get("NEO4J_TRUST_STRATEGY" + name),
          trustedCertificates: configService
            .get("NEO4J_TRUSTED_CERTIFICATES" + name)
            ?.split(",")
            .map(cert => cert.trim()),
          knownHosts: configService.get("NEO4J_KNOWN_HOSTS" + name),
          fetchSize: coerceNumber(configService.get("NEO4J_FETCH_SIZE" + name)),
          maxConnectionPoolSize: coerceNumber(
            configService.get("NEO4J_MAXIMUM_POOL_SIZE" + name),
          ),
          maxTransactionRetryTime: coerceNumber(
            configService.get("NEO4J_TRANSACTION_RETRY_TIME" + name),
          ),
          maxConnectionLifetime: coerceNumber(
            configService.get("NEO4J_MAX_CONNECTION_LIFETIME" + name),
          ),
          connectionAcquisitionTimeout: coerceNumber(
            configService.get("NEO4J_CONNECTION_ACQUISITION_TIMEOUT" + name),
          ),
          connectionTimeout: coerceNumber(
            configService.get("NEO4J_CONNECTION_TIMEOUT" + name),
          ),
          disableLosslessIntegers: isTruthy(
            configService.get("NEO4J_DISABLE_LOSSLESS_INTEGERS" + name),
          ),
          useBigInt: isTruthy(configService.get("NEO4J_USE_BIG_INT" + name)),
          userAgent: configService.get("NEO4J_USER_AGENT" + name),
        },
      }),
    };
    return {
      module: NeogmaCoreModule,
      imports: [ConfigModule],
      providers: [connectionProvider, neogmaModuleOptionsProvider],
      exports: [connectionProvider],
    };
  }

  private static createAsyncProviders(
    options: NeogmaModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<NeogmaOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: NeogmaModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEOGMA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<NeogmaOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<NeogmaOptionsFactory>,
    ];
    return {
      provide: NEOGMA_MODULE_OPTIONS,
      useFactory: async (optionsFactory: NeogmaOptionsFactory) =>
        await optionsFactory.createNeogmaOptions(options.name),
      inject,
    };
  }

  private static async createConnectionFactory(
    options: NeogmaModuleOptions,
  ): Promise<Neogma> {
    return lastValueFrom(
      defer(async () => {
        const neogma = new Neogma(
          {
            url: `${options.scheme}://${options.host}:${options.port}`,
            username: options.username,
            password: options.password,
            database: options.database,
          },
          options.config,
        );

        // const connectionToken = options.name || DEFAULT_CONNECTION_NAME;
        // const models =
        //   EntitiesMetadataStorage.getEntitiesByConnection(connectionToken);
        // neogma.addModels(models as any);

        return neogma;
      }).pipe(handleRetry(options.retryAttempts, options.retryDelay)),
    );
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<Neogma>(
      getConnectionToken(this.options as NeogmaModuleOptions) as Type<Neogma>,
    );
    connection && (await connection.driver.close());
  }
}
