/* eslint-disable @typescript-eslint/ban-types */
import { Provider } from "@nestjs/common";
import { getConnectionToken, getModelToken } from "./shared/neogma.utils";
import { NeogmaModuleOptions } from "./interfaces";
import { Neogma } from "neogma";

export function createNeogmaProviders(
  entities?: Function[],
  connection?: NeogmaModuleOptions | string,
): Provider[] {
  const repositories = (entities || []).map(entity => ({
    provide: getModelToken(entity, connection),
    useFactory: (connection: Neogma) => {
      return entity;
    },
    inject: [getConnectionToken(connection)],
  }));

  return [...repositories];
}
