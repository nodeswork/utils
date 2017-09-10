should                      = require 'should'

{ timeout, TIMEOUT_ERROR }  = require '../dist/promise'

describe 'promise', ->

  it 'should timeout', ->
    try
      p = new Promise(() => )
      await timeout(p, 100)
      should.fail()
    catch e
      e.should.be.equal TIMEOUT_ERROR

  it 'should timeout for Promise.timeout', ->

    try
      p = new Promise(() => )
      await p.timeout(100)
      should.fail()
    catch e
      e.should.be.equal TIMEOUT_ERROR
