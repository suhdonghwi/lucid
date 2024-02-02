export function assert(condition: boolean, message: string): asserts condition {
  if (import.meta.env.PROD) return;

  if (!condition) {
    throw new Error(message);
  }
}
