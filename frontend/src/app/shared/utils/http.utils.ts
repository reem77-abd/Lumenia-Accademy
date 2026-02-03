export function cleanParams<T extends Record<string, any>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}
