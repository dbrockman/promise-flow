import 'native-promise-only';
import { zipObject } from './internal/zip-object';

export function allObject(object) {
  const keys = Object.keys(object);
  return Promise.all(keys.map(key => object[key])).then(values => zipObject(keys, values));
}
