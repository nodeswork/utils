should                        = require 'should'
{ NodesworkError, validator } = require '../dist'


describe 'validator', ->

  describe 'isRequired', ->

    it 'should throw error for null', ->

      should(() -> validator.isRequired null)
        .throw {
          message: 'Required field is missing'
        }

    it 'should throw error for undefined', ->

      should(() -> validator.isRequired undefined)
        .throw {
          message: 'Required field is missing'
        }

    it 'should not throw error for value', ->

      should(() -> validator.isRequired 1)
        .not
        .throw {}

    it 'should pass message', ->

      should(() -> validator.isRequired null, message: 'Customized message')
        .throw {
          message: 'Customized message'
        }
