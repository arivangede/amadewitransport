import { intlLocale } from "@/i18n";
import { Discount, DISCOUNT_TYPE } from "@/types/prisma";

interface Discountable {
  base_rate: number;
  discounts: { discount: Discount }[] | null;
}

export function formatIDR(value: number, lang: string) {
  return new Intl.NumberFormat(intlLocale(lang), {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Active discount (the API already filters by validity) and resulting price. */
export function getPricing(item: Discountable, lang: string) {
  const discount = item.discounts?.[0]?.discount ?? null;
  let price = item.base_rate;
  if (discount) {
    price =
      discount.discount_type === DISCOUNT_TYPE.PERCENTAGE ||
      (discount.discount_type as string) === "PERCENTAGE"
        ? item.base_rate * (1 - discount.discount_value / 100)
        : item.base_rate - discount.discount_value;
  }
  price = Math.max(0, Math.round(price));
  const hasDiscount = !!discount && price < item.base_rate;
  const discountLabel = !hasDiscount
    ? ""
    : (discount.discount_type as string) === "PERCENTAGE"
      ? `${discount.discount_value}%`
      : formatIDR(discount.discount_value, lang);

  return {
    price,
    basePrice: item.base_rate,
    hasDiscount,
    discountLabel,
    discountName: discount?.name ?? "",
    formatted: formatIDR(price, lang),
    formattedBase: formatIDR(item.base_rate, lang),
  };
}

export function getInclusions(raw: unknown): { item: string; description?: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => (typeof entry === "string" ? { item: entry } : (entry as { item: string; description?: string })))
    .filter((entry) => entry && entry.item);
}
