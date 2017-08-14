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

  meta:   Meta;
  cause:  Error;

  constructor(message: string, meta: Meta = {}, cause: Error = null) {
    super(message);
    this.meta   = meta;
    this.cause  = cause;
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
    return new this('Unkown error', undefined, error);
  }
}


export let passthroughCaster: ErrorCaster = {

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


export class ValidationError extends NodesworkError {
}


NodesworkError.addErrorCaster(passthroughCaster);
