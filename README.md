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

```js
promise_flow.allObject({
  key1: Promise.resolve('value from a promise'),
  key2: 'non-promise value'
}).then(function(result) {
  // result == { key1: 'value from a promise', key2: 'non-promise value' }
});
```


### `series(factories)`

Signature `series<T>(factories: Array<() => Promise<T> | T): Array<T>`

Takes an array of functions that will be executed in series. Each one will wait until the previous function is done.

```js
promise_flow.series([
  () => Promise.resolve('value from a promise'),
  () => 'non-promise value'
]).then(function(result) {
  // result == ['value from a promise', 'non-promise value']
});
```
