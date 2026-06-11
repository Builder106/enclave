export function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}

export function f1(x: number): string {
  return x.toFixed(2);
}

export function ms(x: number): string {
  return Math.round(x).toLocaleString("en-US");
}

export function usd(x: number): string {
  if (x === 0) return "$0";
  if (x < 0.01) return `$${x.toFixed(4)}`;
  return `$${x.toFixed(2)}`;
}

export function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
