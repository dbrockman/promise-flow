import 'native-promise-only';
import zipObject from './internal/zip-object';
import tryInvoke from './internal/try-invoke';


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
  return Promise.all(factories.map(tryInvoke));
}


export function map(array, closure) {
  try {
    return Promise.all(array.map((value, index) => closure(value, index)));
  }
  catch (err) {
    return Promise.reject(err);
  }
}


export function mapSeries(array, closure) {
  try {
    return series(array.map((value, index) => () => closure(value, index)));
  }
  catch (err) {
    return Promise.reject(err);
  }
}


export function entangledCallback(optional_value_resolver) {
  let resolve_fn;
  let reject_fn;

  const promise = new Promise((resolve, reject) => {
    resolve_fn = resolve;
    reject_fn = reject;
  });

  const callback = (err, ...values) => {
    if (err) {
      reject_fn(err);
      return;
    }

    if (!optional_value_resolver) {
      resolve_fn(values[0]);
      return;
    }

    let value;
    try {
      value = optional_value_resolver(...values);
    }
    catch (value_resolver_err) {
      reject_fn(value_resolver_err);
      return;
    }
    resolve_fn(value);
  };

  return [promise, callback];
}
