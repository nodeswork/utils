should                         = require 'should'
{ NodesworkError, validator2 } = require '../dist'


describe 'validator2', ->

  describe '#validate', ->

    it 'should pass for value match', ->

      validator2.compile(foo: 'bar') foo: 'bar'

      validator2.compile(foo: 'bar') {}

    it 'should not pass for not matching value', ->

      should(() ->
        validator2.compile(foo: 'bar') foo: 'foo'
      )
        .throw {
          message: 'Invalid value'
          meta:
            responseCode: 422
            path: 'foo'
        }

    it 'should set nested path correctly', ->

      should(() ->
        validator2.compile(foo: bar: 'target') foo: bar: 'nontarget'
      )
        .throw {
          message: 'Invalid value'
          meta:
            responseCode: 422
            path: 'foo.bar'
        }


    commonRule = {}
    for i in [1..20]
      commonRule["foo#{i}"] = bar: 'value'

    it 'tells performance for precompile', ->

      compiled = validator2.compile commonRule

      for i in [0..10000]
        try
          compiled commonRule
        catch e

    it 'tells performance for nocompile', ->

      for i in [0..10000]
        try
          compiled = validator2.compile commonRule
          compiled commonRule
        catch e


    it 'should pass for list of rule', ->

      compiled = validator2.compile(
        foo: [
          validator2.isRequired()
        ]
      )

      compiled foo: '123'

      should(() ->
        compiled bar: '123'
      )
        .throw {
          message: 'Missing required field'
          meta:
            responseCode: 422
            path: 'foo'
        }

    it 'should allow set dollar prefix as required', ->

      compiled = validator2.compile(
        $foo: [
          $bar: []
        ]
      )

      should(() ->
        compiled bar: '123'
      )
        .throw {
          message: 'Missing required field'
          meta:
            responseCode: 422
            path: 'foo'
        }

      should(() ->
        compiled foo: 123
      )
        .throw {
          message: 'Missing required field'
          meta:
            responseCode: 422
            path: 'foo.bar'
        }

    it 'should return default value', ->

      compiled = validator2.compile(
        foo: validator2.setDefault('bar')
      )
      compiled({}).should.have.properties foo: 'bar'

    it 'should return default value for array', ->

      compiled = validator2.compile(
        foo:
          bar: validator2.setDefault('bar')
      )
      res = compiled(foo: [{}])
      res.should.have.properties foo: [{bar: 'bar'}]
