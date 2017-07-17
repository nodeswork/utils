import * as _ from 'underscore'
import * as validator from 'validator'

import { NAMED } from './functions'
import { ValidationError, ErrorOptions } from './error'


const ERR_OPT_VALITE_FAILED           = {
  message: 'Validate failed'
};
const ERR_OPT_MISSING_REQUIRED_FIELD  = {
  message: 'Missing required field'
};
const ERR_OPT_INVALID_VALUE           = {
  message: 'Invalid value'
};


export interface IValidateFunc {
  (value: any): any
}


interface IBooleanValidateFunc {
  (value: any): boolean
}


export interface IValidator {
  (args: any[]): IValidateFunc
}


function wrapper(
  name: string, options: ErrorOptions, fn: IBooleanValidateFunc,
  filterNull: boolean = true
): IValidateFunc {
  _.defaults(options, ERR_OPT_INVALID_VALUE);
  return NAMED(name, (value: any) => {
    if (filterNull && value == null) {
      return;
    }

    if (!fn(value)) {
      throw new ValidationError(
        options.message,
        _.extend({ responseCode: 422 }, options.meta)
      )
    }

    return value;
  });
}


export function isRequired(options: ErrorOptions = {}): IValidateFunc {
  _.defaults(options, ERR_OPT_MISSING_REQUIRED_FIELD);
  return wrapper('isRequired', options, ((value) => value != null), false);
}


export function isIn(ranges: any[], options: ErrorOptions = {}): IValidateFunc {
  return wrapper('isIn', options, (value) => value in ranges);
}


export function isNotIn(
  ranges: any[], options: ErrorOptions = {}
): IValidateFunc {
  return wrapper('isNotIn', options, (value) => !(value in ranges));
}


export function contains(seed: any, options: ErrorOptions = {}): IValidateFunc {
  return wrapper('contains', options, (value) => validator.contains(value, seed));
}


export function equals(
  comparison: any, options: ErrorOptions = {}
): IValidateFunc {
  return wrapper('equals', options, (value) => validator.equals(value, comparison));
}


export function notEquals(
  comparison: any, options: ErrorOptions = {}
): IValidateFunc {
  return wrapper('notEquals', options, (value) => !validator.equals(value, comparison));
}


export function setDefault(defaultValue: any): IValidateFunc {
  return function setDefault(value): any {
    return value == null ? defaultValue : value;
  };
}


interface CompiledRule {
  validators: IValidateFunc[],
  subFields: {
    [path: string]: IValidateFunc,
  }
}


function validateObject(rule: CompiledRule, value: any): any {
  let ret: any = {};

  for (let field in rule.subFields) {
    try {
      ret[field] = rule.subFields[field](value[field]);
    } catch (e) {
      if (e instanceof ValidationError) {
        e.meta.path = (
          e.meta.path ? field + "." + e.meta.path : field
        );
      }
      throw e;
    }
  }

  return ret;
}


function valideFromCompiledRule(rule: CompiledRule): IValidateFunc {
  return NAMED('nestedValidate', (value: any) => {
    for (let validator of rule.validators) {
      value = validator(value);
    }

    if (value == null || _.isEmpty(rule.subFields)) { return value; }

    if (_.isArray(value)) {
      let ret = [];
      for (let v of value) {
        ret.push(validateObject(rule, v));
      }
      return ret;
    } else {
      return validateObject(rule, value);
    }
  });
}


export interface CompileOption {
  dollarPrefix?:  boolean
  required?:      boolean
}


export function compile(
  rules: any, { dollarPrefix = true, required = false }: CompileOption = {}
): IValidateFunc {

  let compiledRule: CompiledRule = {
    validators: [],
    subFields: {},
  };

  if (required) {
    compiledRule.validators.push(isRequired());
  }

  function eachRule(rules: any) {
    if (_.isArray(rules)) {
      for (let rule of (rules as any[])) {
        eachRule(rule);
      }
    } else if (_.isFunction(rules)) {
      compiledRule.validators.push(rules);
    } else if (_.isObject(rules)) {
      for (let field in rules) {
        let requireSubField = false;
        let subRules = rules[field];
        if (dollarPrefix && field.startsWith('$')) {
          requireSubField = true;
          field           = field.substring(1);
        }

        compiledRule.subFields[field] = compile(subRules, {
          dollarPrefix, required: requireSubField
        });
      }
    } else {
      compiledRule.validators.push(equals(rules));
    }
  }

  eachRule(rules);

  return valideFromCompiledRule(compiledRule);
}
