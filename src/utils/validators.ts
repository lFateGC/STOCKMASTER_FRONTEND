export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export function isPositiveNumber(val: any): boolean {
  const n = Number(val);
  return !isNaN(n) && n > 0;
}
