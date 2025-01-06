/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Inject } from "@nestjs/common";
import { NeogmaModuleOptions } from "../interfaces";
import { getConnectionToken, getModelToken } from "./neogma.utils";
import { NEOGMA_DEFAULT_CONNECTION_NAME } from "../neogma.constants";

export const InjectModel = (
  entity: Function,
  connection: string = NEOGMA_DEFAULT_CONNECTION_NAME,
) => Inject(getModelToken(entity, connection));

export const InjectConnection: (
  connection?: NeogmaModuleOptions | string,
) => ParameterDecorator = (connection?: NeogmaModuleOptions | string) =>
  Inject(getConnectionToken(connection));
