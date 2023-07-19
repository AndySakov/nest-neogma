import { Config } from "neo4j-driver";
import { Neo4jConnection } from "./neo4j-connection.interface";
import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from "@nestjs/common";

export type NeogmaConfig = {
  /**
   * Connection name
   */
  name?: string;
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
};

export type NeogmaModuleOptions = NeogmaConfig & Partial<Neo4jConnection>;

type NeogmaParams = {
  url: string;
  username: string;
  password: string;
};

export type NeogmaOptions = {
  params: NeogmaParams;
  options: Config;
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
