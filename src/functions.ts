export function NAMED<T>(name: string, fn: T): T {
  Object.defineProperty(fn, 'name', {
    get: () => name
  });
  return fn;
}
