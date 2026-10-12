import i18n from "@/i18n";

const RAW_PHONE: string =
  import.meta.env.VITE_CONTACT_NUMBER || "+62 813-3933-9520";

export const CONTACT_PHONE = RAW_PHONE;
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL || "";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=CV%20Amadewi%20Transport%20Service%20Batubulan";

interface BookingMessage {
  item?: string;
  discount?: string;
  date?: string;
  pickup?: string;
  guests?: string | number;
}

/** Builds a wa.me link with a pre-filled, localised booking message. */
export function whatsappLink(details: BookingMessage = {}) {
  const t = i18n.getFixedT(i18n.resolvedLanguage ?? null, "common");
  const lines = [
    t("whatsapp.greeting"),
    t("whatsapp.item", { item: details.item || t("whatsapp.general") }),
  ];
  if (details.discount) lines.push(t("whatsapp.discount", { discount: details.discount }));
  if (details.pickup) lines.push(t("whatsapp.pickup", { pickup: details.pickup }));
  if (details.guests) lines.push(t("whatsapp.guests", { guests: details.guests }));
  lines.push(details.date ? t("whatsapp.date", { date: details.date }) : t("whatsapp.dateEmpty"));

  const phone = RAW_PHONE.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
