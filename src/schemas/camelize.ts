import camelcaseKeys from "camelcase-keys";

export const camelize = <
  T extends readonly unknown[] | Record<string, unknown>
>(
  val: T
) => camelcaseKeys(val);
