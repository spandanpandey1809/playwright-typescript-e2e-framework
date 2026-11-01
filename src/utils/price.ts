/** "Rs. 1,500" -> 1500 */
export function parsePrice(text: string): number {
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) throw new Error(`No price found in "${text}"`);
  return Number(digits);
}

/** 1500 -> "Rs. 1500", the format the site uses */
export function formatPrice(amount: number): string {
  return `Rs. ${amount}`;
}
