import 'native-promise-only';
import { zipObject } from './internal/zip-object';

export function allObject(object) {
  const keys = Object.keys(object);
  const values = keys.map(key => object[key]);
  return Promise.all(values).then(values => zipObject(keys, values));
}

