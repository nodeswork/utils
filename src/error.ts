import * as _ from 'underscore'

export interface ErrorCaster {
  filter(error: any, options: ErrorOptions): boolean
  cast(error: any, options: ErrorOptions, cls: NodesworkErrorClass): NodesworkError
}


export interface ErrorOptions {
  message?: string
  meta?:    Meta
}


export interface NodesworkErrorClass {
  new(message: string, meta: object, cause: Error): NodesworkError
}


export interface Meta {
  responseCode?:  number
  path?:          string
  [key: string]:  any
}


/**
 * Basic NodesworkError class which wrap from Error class.
 */
export class NodesworkError extends Error {

  constructor(
    message: string, public meta: Meta = {}, public cause: Error = null
  ) {
    super(message);
  }

  toJSON(include: {cause?: boolean, stack?: boolean} = {}): object {
    let constructor: any = <any>this.constructor;
    let ret: any = {
      name:     (this.constructor as any).name,
      message:  this.message,
      meta:     _.extend({}, constructor.meta, this.meta),
    };

    if (include.cause && this.cause != null) {
      if (this.cause instanceof NodesworkError) {
        ret.cause = (<NodesworkError>this.cause).toJSON(include);
      } else if (include.stack && this.cause.stack) {
        ret.cause = this.cause.stack;
      } else {
        ret.cause = this.cause.toString();
      }
    }

    if (include.stack) {
      ret.stack = this.stack.toString();
    }
    return ret;
  }

  static errorCasters: Array<ErrorCaster> = [];

  static addErrorCaster(caster: ErrorCaster) {
    this.errorCasters.push(caster);
  }

  static cast(error: any, options: ErrorOptions = {}): NodesworkError {
    for (let caster of this.errorCasters) {
      if (caster.filter(error, options)) {
        return caster.cast(error, options, this);
      }
    }
    return this.internalServerError(undefined, undefined, error);
  }

  static badRequest(
    message: string = 'Bad Request',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 400}), cause,
    );
  }

  static unauthorized(
    message: string = 'Unauthorized',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 401}), cause,
    );
  }

  static paymentRequired(
    message: string = 'Payment Required',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 402}), cause,
    );
  }

  static forbidden(
    message: string = 'Forbidden',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 403}), cause,
    );
  }

  static notFound(
    message: string = 'Not Found',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 404}), cause,
    );
  }

  static methodNotAllowed(
    message: string = 'Method Not Allowed',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 405}), cause,
    );
  }

  static notAcceptable(
    message: string = 'Not Acceptable',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 406}), cause,
    );
  }

  static proxyAuthenticationRequired(
    message: string = 'Proxy Authentication Required',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 407}), cause,
    );
  }

  static requestTimeout(
    message: string = 'Request Timeout',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 408}), cause,
    );
  }

  static conflict(
    message: string = 'Conflict',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 409}), cause,
    );
  }

  static gone(
    message: string = 'Gone',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 410}), cause,
    );
  }

  static lengthRequired(
    message: string = 'Length Required',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 411}), cause,
    );
  }

  static preconditionFailed(
    message: string = 'Precondition Failed',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 412}), cause,
    );
  }

  static payloadTooLarge(
    message: string = 'Payload Too Large',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 413}), cause,
    );
  }

  static uriTooLong(
    message: string = 'Uri Too Long',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 414}), cause,
    );
  }

  static unsupportedMediaType(
    message: string = 'Unsupported Media Type',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 415}), cause,
    );
  }

  static rangeNotSatisfiable(
    message: string = 'Range Not Satisfiable',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 416}), cause,
    );
  }

  static expectationFailed(
    message: string = 'Expectation Failed',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 417}), cause,
    );
  }

  static imATeapot(
    message: string = 'I\'m A Teapot',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 418}), cause,
    );
  }

  static unprocessableEntity(
    message: string = 'Unprocessable Entity',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 422}), cause,
    );
  }

  static locked(
    message: string = 'Locked',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 423}), cause,
    );
  }

  static failedDependency(
    message: string = 'Failed Dependency',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 424}), cause,
    );
  }

  static upgradeRequired(
    message: string = 'Upgrade Required',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 426}), cause,
    );
  }

  static preconditionRequired(
    message: string = 'Precondition Required',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 428}), cause,
    );
  }

  static tooManyRequests(
    message: string = 'Too Many Requests',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 429}), cause,
    );
  }

  static requestHeaderFieldsTooLarge(
    message: string = 'Request Header Fields Too Large',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 431}), cause,
    );
  }

  static internalServerError(
    message: string = 'Internal Server Error',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 500}), cause,
    );
  }

  static notImplemented(
    message: string = 'Not Implemented',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 501}), cause,
    );
  }

  static badGateway(
    message: string = 'Bad Gateway',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 502}), cause,
    );
  }

  static serviceUnavailable(
    message: string = 'Service Unavailable',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 503}), cause,
    );
  }

  static gatewayTimeout(
    message: string = 'Gateway Time-out',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 504}), cause,
    );
  }

  static httpVersionNotSupported(
    message: string = 'Http Version Not Supported',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 505}), cause,
    );
  }

  static variantAlsoNegotiates(
    message: string = 'Variant Also Negotiates',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 506}), cause,
    );
  }

  static insufficientStorage(
    message: string = 'Insufficient Storage',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 507}), cause,
    );
  }

  static loopDetected(
    message: string = 'Loop Detected',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 508}), cause,
    );
  }

  static notExtended(
    message: string = 'Not Extended',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 510}), cause,
    );
  }

  static networkAuthenticationRequired(
    message: string = 'Network Authentication Required',
    meta: Meta = {},
    cause: Error = null,
  ) {
    return new NodesworkError(
      message, _.extend(meta, {responseCode: 511}), cause,
    );
  }
}

export let PASSTHROUGH_CASTER: ErrorCaster = {

  filter: (error: any, options: ErrorOptions) => {
    return error instanceof NodesworkError
  },

  cast: (error: any, options: ErrorOptions, cls: NodesworkErrorClass
  ): NodesworkError => {

    if (options && (options.message || options.meta)) {
      let castError = new cls(options.message, options.meta, error);
      return castError;
    }
    return <NodesworkError>error;
  },
};

export const HTTP_RESPONSE_CASTER: ErrorCaster = {
  filter: (error: any, options: ErrorOptions) => {
    return error.name === 'StatusCodeError' && error.error &&
      error.error.name === 'NodesworkError';
  },

  cast: (
    error: any, options: ErrorOptions, cls: NodesworkErrorClass,
  ) => {
    return new NodesworkError(error.error.message, error.error.meta);
  },
};

export const JSON_CASTER: ErrorCaster = {
  filter: (error: any, options: ErrorOptions) => {
    return error && error.name === 'NodesworkError' &&
      !(error instanceof NodesworkError);
  },

  cast: (
    error: any, options: ErrorOptions, cls: NodesworkErrorClass,
  ) => {
    return new NodesworkError(error.message, error.meta, error.cause);
  },
};

export class ValidationError extends NodesworkError {
}

NodesworkError.addErrorCaster(PASSTHROUGH_CASTER);
NodesworkError.addErrorCaster(JSON_CASTER);
