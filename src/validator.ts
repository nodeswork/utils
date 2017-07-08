import * as validator from 'validator'

import { NodesworkError, ErrorOptions } from './error'

const ERROR_MSG_REQUIRED_VALUE = 'Required field is missing';
const ERROR_MSG_INVALID_VALUE = 'Value is invalid';

let isRequired = (
  value: any,
  { message = ERROR_MSG_REQUIRED_VALUE, meta }: ErrorOptions = {}
) => {
  if (value == null) {
    throw new NodesworkError(message, meta);
  }
}

let isIn = (
  value: any,
  ranges: Array<any>,
  { message = ERROR_MSG_INVALID_VALUE, meta }: ErrorOptions = {}
) => {
  if (!(value in ranges)) {
    throw new NodesworkError(message, meta);
  }
}

let contains = (
  str: string,
  seed: any,
  { message = ERROR_MSG_INVALID_VALUE, meta }: ErrorOptions = {}
) => {
  if (str != null && validator.contains(str, seed)) {
    throw new NodesworkError(message, meta);
  }
}

let equals = (
  value: any,
  comparison: any,
  { message = ERROR_MSG_INVALID_VALUE, meta }: ErrorOptions = {}
) => {
  if (value != null && validator.equals(value, comparison)) {
    throw new NodesworkError(message, meta);
  }
}

let notEquals = (
  value: any,
  comparison: any,
  { message = ERROR_MSG_INVALID_VALUE, meta }: ErrorOptions = {}
) => {
  if (value != null && !validator.equals(value, comparison)) {
    throw new NodesworkError(message, meta);
  }
}

export {
  isRequired,
  isIn,
  contains,
  equals,
  notEquals,
}
