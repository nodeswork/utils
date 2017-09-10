# @nodeswork/utils

Utilities used across nodeswork repos.

## Installation

    npm install --save @nodeswork/utils

## Key Components

Index | Component         | Description
:-----|:------------------|:--------------------------------------------
1     | Error             | Basic Error class
2     | Validator         | Validate object fields
3     | Validator2        | Validate object fields
4     | Http Handler      | Utility functions for handling HTTP requests
5     | Utility Functions | Some other basic utility functions

## Error Class

### constructor

Param   | Required      | Type         | Description
:-------|:--------------|:-------------|:-----------
message | required      | string       |
meta    | default: {}   | ErrorMeta    |
cause   | default: null | Error or any | any
