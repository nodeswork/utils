import * as validator from './validator'
import * as handler from './handler'

export * from './error'
export {
  handler,
  validator
}


export function NAMED(name: string, fn: Function): Function {
  Object.defineProperty(fn, 'name', {
    get: () => name
  });
  return fn;
}
