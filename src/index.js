import 'native-promise-only';
import { zipObject } from './internal/zip-object';

export function allObject(object) {
  const keys = Object.keys(object);
  return Promise.all(keys.map(key => object[key])).then(values => zipObject(keys, values));
}

export function series(factories) {
  const promises = [];
  let promise = Promise.resolve();
  factories.forEach(f => {
    promise = promise.then(() => f());
    promises.push(promise);
  });
  return Promise.all(promises);
}

export function parallel(factories) {
  try {
    return Promise.all(factories.map(f => f()));
  }
  catch (err) {
    return Promise.reject(err);
  }
}
