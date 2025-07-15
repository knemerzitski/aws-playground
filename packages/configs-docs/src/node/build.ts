// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNode(): any {
  if (typeof process !== 'undefined') {
    return false;
  }

  // In browser
  return true;
}

console.log(5);

function esNextOr2024Required() {
  const setA = new Set([1, 2, 3]);
  const setB = new Set([3, 4, 5]);

  // New Set methods
  setA.union(setB);
  setA.intersection(setB);
}

esNextOr2024Required();
