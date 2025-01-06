import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  NeogmaModule,
  NeogmaModuleOptions,
  getConnectionToken,
} from "../index";
import { Neogma } from "neogma";

describe("ProfileService", () => {
  let neogma: Neogma;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        NeogmaModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) =>
            ({
              host: configService.get<string>("NEO4J_HOST_TEST"),
              password: configService.get<string>("NEO4J_PASSWORD_TEST"),
              port: configService.get<string>("NEO4J_PORT_TEST"),
              scheme: configService.get<string>("NEO4J_SCHEME_TEST"),
              username: configService.get<string>("NEO4J_USERNAME_TEST"),
              database: configService.get<string>("NEO4J_DATABASE_TEST"),
              retryAttempts: 5,
              retryDelay: 5000,
            }) as NeogmaModuleOptions,
        }),
      ],
    }).compile();

    await module.init();
    // const tempNeogma = module.get<Neogma>(getConnectionToken());
    neogma = module.get<Neogma>(getConnectionToken());
    // await cloneData({ from: readNeogma, to: tempNeogma });
  }, 1000000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(neogma).toBeDefined();
    expect(async () => {
      await neogma.verifyConnectivity();
    }).not.toThrow();
  });
});
