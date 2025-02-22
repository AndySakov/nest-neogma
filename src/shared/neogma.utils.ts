/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Neogma } from "neogma";
import { NeogmaModuleOptions } from "../interfaces/neogma-options.interface";
import { NEOGMA_DEFAULT_CONNECTION_NAME } from "../neogma.constants";
import { Logger, Type } from "@nestjs/common";
import { Observable, delay, retryWhen, scan } from "rxjs";
import { CircularDependencyException } from "../exceptions/circular-dependency.exception";

const logger = new Logger("NeogmaModule");

/**
 * This function generates an injection token for a Model
 * @param {Function} This parameter can be a Model
 * @param {string} [connection='default'] Connection name
 * @returns {string} The Model injection token
 */
export function getModelToken(
  entity: Function,
  connection: NeogmaModuleOptions | string = NEOGMA_DEFAULT_CONNECTION_NAME,
): string {
  if (entity === null || entity === undefined) {
    throw new CircularDependencyException("@InjectModel()");
  }
  const connectionPrefix = getConnectionPrefix(connection);
  return `${connectionPrefix}${entity.name}Repository`;
}

/**
 * This function returns a Connection injection token for the given NeogmaModuleOptions or connection name.
 * @param {NeogmaModuleOptions | string} [connection='default'] This optional parameter is either
 * a NeogmaModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: NeogmaModuleOptions | string = NEOGMA_DEFAULT_CONNECTION_NAME,
): string | Function | Type {
  return NEOGMA_DEFAULT_CONNECTION_NAME === connection
    ? Neogma
    : "string" === typeof connection
      ? `${connection}Connection`
      : NEOGMA_DEFAULT_CONNECTION_NAME === connection.name || !connection.name
        ? Neogma
        : `${connection.name}Connection`;
}

/**
 * This function returns a connection prefix based on the connection name
 * @param {NeogmaModuleOptions | string} [connection='default'] This optional parameter is either
 * a NeogmaModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionPrefix(
  connection: NeogmaModuleOptions | string = NEOGMA_DEFAULT_CONNECTION_NAME,
): string {
  if (connection === NEOGMA_DEFAULT_CONNECTION_NAME) {
    return "";
  }
  if (typeof connection === "string") {
    return connection + "_";
  }
  if (connection.name === NEOGMA_DEFAULT_CONNECTION_NAME || !connection.name) {
    return "";
  }
  return connection.name + "_";
}

export function handleRetry(
  retryAttempts = 10,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen(e =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${
                errorCount + 1
              })...`,
              error.stack,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

export const isTruthy = (value: unknown): value is true => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string" && value === "true") {
    return true;
  }

  return false;
};

export const coerceNumber = (value: string | undefined): number | undefined => {
  if (value !== undefined) {
    const coerced = parseInt(value);

    return Number.isNaN(coerced) ? undefined : coerced;
  }

  return undefined;
};
