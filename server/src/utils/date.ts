export function addDays(d: Date, days: number): Date {
  const d2 = new Date(d);
  d2.setDate(d2.getDate() + days);
  return d2;
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime())/(1000*60*60*24));
}
