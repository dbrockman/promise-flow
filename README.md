[![Build Status](https://travis-ci.org/dbrockman/promise-flow.svg?branch=master)](https://travis-ci.org/dbrockman/promise-flow)

# promise-flow

Utility module for functions that return promises


## Example

```js
import * as pf from 'promise-flow';

pf.allObject({
  key1: Promise.resolve('value from a promise'),
  key2: 'non-promise value'
}).then(function(result) {
  // result == { key1: 'value from a promise', key2: 'non-promise value' }
});
```


## API

### `allObject(object)`

Returns a promise that resolves with a copy of the input object when all values have resolved.
