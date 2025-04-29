export function unwrap<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Unwrapping value that is null or undefined");
  }
  return value;
}
