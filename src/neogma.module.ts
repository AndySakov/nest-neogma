/* eslint-disable @typescript-eslint/ban-types */
import { Module, DynamicModule } from "@nestjs/common";
import {
  NeogmaConfig,
  NeogmaModuleAsyncOptions,
  NeogmaModuleOptions,
} from "./interfaces/neogma-options.interface";
import { NeogmaCoreModule } from "./neogma-core.module";
// import { DEFAULT_CONNECTION_NAME } from "./neogma.constants";
// import { createNeogmaProviders } from "./neogma.providers";

@Module({})
export class NeogmaModule {
  static forRoot(options: NeogmaModuleOptions): DynamicModule {
    return {
      module: NeogmaModule,
      imports: [NeogmaCoreModule.forRoot(options)],
    };
  }

  // static forFeature(
  //   entities: Function[] = [],
  //   connection: NeogmaModuleOptions | string = DEFAULT_CONNECTION_NAME,
  // ): DynamicModule {
  //   const providers = createNeogmaProviders(entities, connection);
  //   // EntitiesMetadataStorage.addEntitiesByConnection(connection, entities);
  //   return {
  //     module: NeogmaModule,
  //     providers: providers,
  //     exports: providers,
  //   };
  // }

  static forRootAsync(options: NeogmaModuleAsyncOptions): DynamicModule {
    return {
      module: NeogmaModule,
      imports: [NeogmaCoreModule.forRootAsync(options)],
    };
  }

  static fromEnv(options?: NeogmaConfig): DynamicModule {
    return {
      module: NeogmaModule,
      imports: [NeogmaCoreModule.fromEnv(options)],
    };
  }
}
