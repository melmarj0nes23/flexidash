export const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "CN¥", name: "Chinese Yuan" },
];

export function getCurrencySymbol(code: string): string {
  const c = currencies.find((c) => c.code === code);
  return c ? c.symbol : "$";
}
