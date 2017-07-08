{ NodesworkError } = require '../dist'

describe 'NodesworkError', ->

  describe '#toJSON', ->

    it 'returns correct fields without message', ->

      error = new NodesworkError()

      error.toJSON().should.have.properties {
        name:     'NodesworkError'
        message:  ''
        meta:     {}
      }

    it 'returns message', ->

      error = new NodesworkError 'error message'

      error.toJSON().should.have.properties {
        name:     'NodesworkError'
        message:  'error message'
        meta:     {}
      }

    it 'returns callstack', ->

      error = new NodesworkError 'error message'

      json  = error.toJSON(stack: true)

      json.should.have.properties {
        name:     'NodesworkError'
        message:  'error message'
        meta:     {}
      }
      json.should.have.properties 'stack'

  describe '#cast', ->

    it 'passthrough nodeswork error', ->

      error = new NodesworkError 'error'

      castedError = NodesworkError.cast error

      castedError.should.be.exactly error

    it 'create new nodeswork error when options applied', ->

      error = new NodesworkError 'error'

      castedError = NodesworkError.cast error, message: 'new error'

      json = castedError.toJSON cause: true

      json.should.have.properties {
        name:     'NodesworkError'
        message:  'new error'
        meta:     {}
      }
      json.cause.should.have.properties {
        name:     'NodesworkError'
        message:  'error'
        meta:     {}
      }
