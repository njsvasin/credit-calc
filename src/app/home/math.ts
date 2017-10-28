export function round(x, precision = 2) {
  return Math.round(x * Math.pow(10, precision)) / Math.pow(10, precision);
}
