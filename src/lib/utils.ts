const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Formats a numeric USD amount with the standard showroom presentation.
 * Example: 590000 -> "$590,000 USD"
 */
export function formatUSD(value: number): string {
  return `${usdFormatter.format(value)} USD`;
}

/**
 * Builds a wa.me link with a prefilled, URL-safe message.
 * The phone number is normalized to digits only.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function getUnitShareUrl(code: string): string {
  if (typeof window === "undefined") {
    return `/?unit=${encodeURIComponent(code)}`;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("unit", code);
  return url.toString();
}
