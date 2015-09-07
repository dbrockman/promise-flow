export function deferredFactoryResolveSpy(resolve_value) {
  let resolve_fn;
  const resolve_spy = sinon.spy(v => resolve_fn(v));
  const promise = new Promise(resolve => {
    resolve_fn = sinon.spy(resolve);
  });
  const factory_spy = sinon.spy(() => {
    setImmediate(resolve_spy, resolve_value);
    return promise;
  });
  return [factory_spy, resolve_spy];
}
