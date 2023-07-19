import { Inject } from "@nestjs/common";
import { NeogmaModuleOptions } from "../interfaces";
import { getConnectionToken } from "./neogma.utils";
// import { DEFAULT_CONNECTION_NAME } from "../neogma.constants";

// export const InjectModel = (
//   entity: Function,
//   connection: string = DEFAULT_CONNECTION_NAME
// ) => Inject(getModelToken(entity, connection));

export const InjectConnection: (
  connection?: NeogmaModuleOptions | string,
) => ParameterDecorator = (connection?: NeogmaModuleOptions | string) =>
  Inject(getConnectionToken(connection));
