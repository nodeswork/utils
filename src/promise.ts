import { NodesworkError } from './error';

export const TIMEOUT_ERROR = new NodesworkError('promise timeout');

declare global {
  interface Promise<T> {
    timeout: (timeoutMillis: number) => Promise<T>
  }
}

if (!Promise.prototype.timeout) {
  Promise.prototype.timeout = function<T>(timeoutMillis: number): Promise<T> {
    let timeout: NodeJS.Timer;
    return Promise.race([
      this,
      new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          reject(TIMEOUT_ERROR);
        }, timeoutMillis);
      }),
    ]).then(
      (v) => {
        clearTimeout(timeout);
        return v;
      },
      (err) => {
        clearTimeout(timeout);
        throw err;
      },
    );
  }
}

export function timeout<T>(p: Promise<T>, timeoutMillis: number): Promise<T> {
  let timeout: NodeJS.Timer;
  return Promise.race([
    p,
    new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        reject(TIMEOUT_ERROR);
      }, timeoutMillis);
    }),
  ]).then(
    (v) => {
      clearTimeout(timeout);
      return v;
    },
    (err) => {
      clearTimeout(timeout);
      throw err;
    },
  ) as any;
}
