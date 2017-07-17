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
  (value: any): void
}


interface IBooleanValidateFunc {
  (value: any): void
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


interface CompiledRule {
  validators: IValidateFunc[],
  subFields: {
    [path: string]: IValidateFunc,
  }
}


function valideFromCompiledRule(rule: CompiledRule): IValidateFunc {
  return NAMED('nestedValidate', (value: any) => {
    for (let validator of rule.validators) {
      validator(value);
    }
    if (value == null) { return; }
    for (let field in rule.subFields) {
      try {
        rule.subFields[field](value[field]);
      } catch (e) {
        if (e instanceof ValidationError) {
          e.meta.path = (
            e.meta.path ? field + "." + e.meta.path : field
          );
        }
        throw e;
      }
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
