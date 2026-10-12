import { ArrowRight, ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { intlLocale } from "@/i18n";
import { whatsappLink } from "@/lib/whatsapp";

const SERVICES = ["charter", "airport", "package"] as const;
const GUESTS = Array.from({ length: 14 }, (_, i) => i + 1);

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Quick quote form. Submitting opens WhatsApp with the details pre-filled. */
export function BookingBar({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation("home");
  const id = useId();
  const [service, setService] = useState<(typeof SERVICES)[number]>("charter");
  const [date, setDate] = useState("");
  const [pickup, setPickup] = useState("");
  const [guests, setGuests] = useState(2);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lang = i18n.resolvedLanguage ?? "en";
    const prettyDate = date
      ? new Intl.DateTimeFormat(intlLocale(lang), { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`))
      : "";
    window.open(
      whatsappLink({ item: t(`booking.services.${service}`), date: prettyDate, pickup, guests }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const field = compact
    ? "flex min-h-11 items-center justify-between gap-4 border-b border-line py-1"
    : "flex flex-col justify-center gap-2 border-r border-line px-7";
  const label = compact ? "label-caps shrink-0 text-[10px] text-mist" : "label-caps text-mist";
  const control = `min-w-0 bg-transparent font-body text-ivory outline-none placeholder:text-fog ${
    compact ? "text-right text-[14px] font-semibold" : "text-[17px] font-medium"
  } [color-scheme:dark]`;

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "flex flex-col gap-2.5 rounded-md border border-ivory/12 bg-surface p-4"
          : "grid h-[104px] grid-cols-[repeat(4,minmax(0,1fr))_240px] rounded-md border border-ivory/12 bg-surface/80 backdrop-blur-[18px]"
      }
    >
      <label htmlFor={`${id}-service`} className={field}>
        <span className={label}>{t("booking.service")}</span>
        <span className="relative flex items-center">
          <select
            id={`${id}-service`}
            value={service}
            onChange={(e) => setService(e.target.value as (typeof SERVICES)[number])}
            className={`${control} w-full cursor-pointer appearance-none ${compact ? "pr-5" : "pr-6"}`}
          >
            {SERVICES.map((s) => (
              <option key={s} value={s} className="bg-surface text-ivory">
                {t(`booking.services.${s}`)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 size-4 text-mist" aria-hidden />
        </span>
      </label>
      <label htmlFor={`${id}-date`} className={field}>
        <span className={label}>{t("booking.date")}</span>
        <input
          id={`${id}-date`}
          type="date"
          value={date}
          min={today()}
          onChange={(e) => setDate(e.target.value)}
          className={`${control} cursor-pointer`}
        />
      </label>
      <label htmlFor={`${id}-pickup`} className={field}>
        <span className={label}>{t("booking.pickup")}</span>
        <input
          id={`${id}-pickup`}
          type="text"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder={t("booking.pickupPlaceholder")}
          autoComplete="street-address"
          className={`${control} w-full`}
        />
      </label>
      <label htmlFor={`${id}-guests`} className={compact ? field : `${field} border-r-0`}>
        <span className={label}>{t("booking.guests")}</span>
        <span className="relative flex items-center">
          <select
            id={`${id}-guests`}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={`${control} w-full cursor-pointer appearance-none ${compact ? "pr-5" : "pr-6"}`}
          >
            {GUESTS.map((n) => (
              <option key={n} value={n} className="bg-surface text-ivory">
                {n}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 size-4 text-mist" aria-hidden />
        </span>
      </label>
      <button
        type="submit"
        className={`flex cursor-pointer items-center justify-center gap-3 bg-ivory font-body text-[13px] font-bold tracking-[0.14em] text-ink uppercase transition-colors hover:bg-gold-hi ${
          compact ? "mt-1.5 h-[52px] rounded-full" : "m-3.5 rounded"
        }`}
      >
        {t("booking.submit")}
        <ArrowRight className="size-[18px]" strokeWidth={1.8} aria-hidden />
      </button>
    </form>
  );
}
