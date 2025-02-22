import { Config } from "neo4j-driver";
import { Neo4jConnection } from "./neo4j-connection.interface";
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from "@nestjs/common";
import { QueryRunner } from "neogma";

export type NeogmaConfig = {
  /**
   * Connection name
   */
  name?: string;
  /**
   * If `true`, models will be synchronized with database.
   * Default: true
   */
  synchronize?: boolean;
  /**
   * Number of times to retry connecting
   * Default: 10
   */
  retryAttempts?: number;
  /**
   * Delay between connection retry attempts (ms)
   * Default: 3000
   */
  retryDelay?: number;
  /**
   * Create a temp db for testing or other purposes
   * If `true`, it will override the `database` param with a random db name which will be automatically deleted by neogma on application shutdown
   * Default: false
   */
  useTempDB?: boolean;
};

export type NeogmaModuleOptions = Partial<Omit<Neo4jConnection, "config">> &
  NeogmaConfig & { config?: ConnectOptionsI };

interface ConnectOptionsI extends Config {
  /** whether to log the statements and parameters to the console */
  logger?: QueryRunner["logger"];
}

export interface NeogmaParams {
  url: string;
  username: string;
  password: string;
  database?: string;
}

export type NeogmaOptions = {
  params: NeogmaParams;
  options: ConnectOptionsI;
};

export interface NeogmaOptionsFactory {
  createNeogmaOptions(
    connectionName?: string,
  ): Promise<NeogmaModuleOptions> | NeogmaModuleOptions;
}

export interface NeogmaModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  useExisting?: Type<NeogmaOptionsFactory>;
  useClass?: Type<NeogmaOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<NeogmaModuleOptions> | NeogmaModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
