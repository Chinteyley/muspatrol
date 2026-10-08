export function l2normalize(values: ArrayLike<number>): number[] {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    sum += v * v;
  }
  const norm = Math.sqrt(sum) || 1;
  const out = new Array<number>(values.length);
  for (let i = 0; i < values.length; i++) {
    out[i] = (values[i] ?? 0) / norm;
  }
  return out;
}

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return dot;
}
