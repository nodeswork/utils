import * as _ from 'underscore'
import * as validator from 'validator'

import { ValidationError, ErrorOptions } from './error'

const ERROR_MSG_REQUIRED_VALUE = 'Required field is missing';
const ERROR_MSG_INVALID_VALUE = 'Value is invalid';

export function isRequired(
  value: any,
  { message = ERROR_MSG_REQUIRED_VALUE, meta = {} }: ErrorOptions = {}
) {
  if (value == null) {
    throw new ValidationError(message, _.extend({
      responseCode: 422,
    }, meta));
  }
}

export function isIn(
  value: any,
  ranges: Array<any>,
  { message = ERROR_MSG_INVALID_VALUE, meta = {} }: ErrorOptions = {}
) {
  if (!(value in ranges)) {
    throw new ValidationError(message, _.extend({
      responseCode: 422,
    }, meta));
  }
}

export function contains(
  str: string,
  seed: any,
  { message = ERROR_MSG_INVALID_VALUE, meta = {} }: ErrorOptions = {}
) {
  if (str != null && validator.contains(str, seed)) {
    throw new ValidationError(message, _.extend({
      responseCode: 422,
    }, meta));
  }
}

export function equals(
  value: any,
  comparison: any,
  { message = ERROR_MSG_INVALID_VALUE, meta = {} }: ErrorOptions = {}
){
  if (value != null && validator.equals(value, comparison)) {
    throw new ValidationError(message, _.extend({
      responseCode: 422,
    }, meta));
  }
}

export function notEquals(
  value: any,
  comparison: any,
  { message = ERROR_MSG_INVALID_VALUE, meta = {} }: ErrorOptions = {}
) {
  if (value != null && !validator.equals(value, comparison)) {
    throw new ValidationError(message, _.extend({
      responseCode: 422,
    }, meta));
  }
}
