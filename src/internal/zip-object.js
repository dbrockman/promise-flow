export function zipObject(keys, values) {
  const result = {};
  const l = keys.length;
  for (let i = 0; i < l; i++) {
    result[keys[i]] = values[i];
  }
  return result;
}
