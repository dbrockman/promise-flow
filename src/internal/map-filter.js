export default function(map, array, closure) {
  return map(array, closure).then(mapped => array.filter((value, index) => mapped[index]));
}
