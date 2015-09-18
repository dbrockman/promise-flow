[![Build Status](https://travis-ci.org/dbrockman/promise-flow.svg?branch=master)](https://travis-ci.org/dbrockman/promise-flow)

# promise-flow

Utility module for functions that return promises.

Note that this module expects a global `Promise` to exist. If used in an environment that does not implement Promise, a shim should be used.


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

> `allObject<T>(object: { [key: string]: Promise<T> | T }): Promise<{ [key: string]: T }>`

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

> `series<T>(factories: Array<() => Promise<T> | T): Promise<Array<T>>`

Takes an array of functions that will be executed in series. Each one will wait until the previous function is done.

If one of the functions returns a rejected promise or throws an error then the resulting promise will reject with that error.

```js
promise_flow.series([
  () => Promise.resolve('value from a promise'),
  () => 'non-promise value'
]).then(function(result) {
  // result == ['value from a promise', 'non-promise value']
});
```


### `parallel(factories)`

> `parallel<T>(factories: Array<() => Promise<T> | T): Promise<Array<T>>`

Same as `series` but will run all functions in parallel.


### `map(array, closure)`

> `map<T, U>(array: Array<T>, closure: (value: T, index: number) => Promise<U> | U): Promise<Array<U>>`

Map the items in the array with a function that may return a promise.


### `mapSeries(array, closure)`

> `map<T, U>(array: Array<T>, closure: (value: T, index: number) => Promise<U> | U): Promise<Array<U>>`

Same as `map` but will run all functions in series.


### `filter(array, closure)`
> `filter<T>(array: Array<T>, closure: (value: T, index: number) => Promise<boolean> | boolean): Promise<Array<T>>`

Filter the array using a function that may return a promise.

To keep a value in the array, return a promise that resolves with a truthy value (or return the value directly).


### `filterSeries(array, closure)`
> `filterSeries<T>(array: Array<T>, closure: (value: T, index: number) => Promise<boolean> | boolean): Promise<Array<T>>`

Same as `filter` but will run all functions in series.


### `entangledCallback(optional_value_resolver)`

> `entangledCallback<T>(optional_value_resolver?: (...values: Array<any>) => T): [Promise<T>, (err: ?Error, ...values: Array<any>) => void]`

Returns a tuple where the first item is a promise and the second item is a node-style callback function. The two are connected so that when the callback is invoked, the promise will be resolved.

An optional function can be provided to reduce arguments passed to the callback to a single value.

```js
// Example where a function that takes a callback is used:
import { readFile } from 'fs';

// Example function that calls readFile and pass the entangled callback instead of wrapping the call in new Promise(...)
function myReadFile(filename, options) {
  const [promise, callback] = promise_flow.entangledCallback();
  readFile(filename, options, callback);
  return promise;
}

// myReadFile will return a promise that is either resolved with the file content or rejected with the error from readFile.
myReadFile('./file.txt').then(handleFileData, handleReadError);
```

```js
// Example callback invocation and the equivalent state of the entangled promise:
const [promise, callback] = promise_flow.entangledCallback();
// callback() is equivalent to Promise.resolve()
// callback(null, 'value') is equivalent to Promise.resolve('value')
// callback(null, 'a', 'b', 'c') is equivalent to Promise.resolve('a')
// callback(new Error('error')) is equivalent to Promise.reject(new Error('error'))

// The optional function argument is used to reduce values passed to the callback to a single value
const [promise, callback] = promise_flow.entangledCallback(Array.of);
// callback(null, 'a') is equivalent to Promise.resolve(['a'])
// callback(null, 'a', 'b', 'c') is equivalent to Promise.resolve(['a', 'b', 'c'])
```
