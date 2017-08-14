import { NodesworkError } from './error'


export interface ILogger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}


export function internalErrorHandler(
  logger: ILogger, { debug = true }: { debug?: boolean } = {}
) {

  return async function handleInternalError(ctx: any, next: Function) {
    try {
      await next();
    } catch (e) {
      let error  = NodesworkError.cast(e);
      ctx.body   = error.toJSON({
        cause: true,
        stack: debug,
      })
      ctx.status = error.meta.responseCode || 500;

      let meta: any = {
        url: ctx.request.url,
        method: ctx.request.method,
        headers: ctx.request.headers,
        error: error.toJSON({ cause: true, stack: true })
      };

      logger.error('Request Internal Error', meta);
    }
  }
}


export function logRequestHandler(requestLogger: ILogger) {

  return async function logRequest(ctx: any, next: Function): Promise<void> {
    let meta: any = {
      url: ctx.request.url,
      method: ctx.request.method,
      headers: ctx.request.headers,
    };
    try {
      await next();
    } finally {
      meta.responseCode = ctx.status;
      if (200 <= ctx.status && ctx.status < 300) {
        requestLogger.info('Request', meta);
      } else if (300 <= ctx.status && ctx.status < 500) {
        requestLogger.warn('Request', meta);
      } else {
        requestLogger.error('Request', meta);
      }
    }
  }
}


export function uncaughtRequestHandler(requestLogger: ILogger) {

  return async function handleUncaughtRequeste(ctx: any): Promise<void> {
    ctx.response.status = 404;
    requestLogger.error('Uncaught request', {
      url: ctx.request.url,
      method: ctx.request.method,
      headers: ctx.request.headers,
    });
  }
}
