import * as validator from './validator'

export * from './error'
export { validator }


export function NAMED(name: string, fn: Function): Function {
  Object.defineProperty(fn, 'name', {
    get: () => name
  });
  return fn;
}
