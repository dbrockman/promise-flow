export default function(fn) {
  try {
    return fn();
  }
  catch (err) {
    return Promise.reject(err);
  }
}
