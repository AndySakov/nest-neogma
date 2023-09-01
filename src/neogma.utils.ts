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
