import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { enUS, id as idLocale } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { intlLocale } from "@/i18n";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

const SERVICES = ["charter", "airport", "package"] as const;
const GUESTS = Array.from({ length: 14 }, (_, i) => i + 1);
const CALENDAR_LOCALES = { en: enUS, id: idLocale };

type Service = (typeof SERVICES)[number];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Shared skin for the landing's popovers — they portal out of `.landing`, so fonts and colours are explicit. */
const POPOVER = "w-auto rounded-md border border-line-strong bg-surface p-1.5 font-body text-ivory shadow-[0_24px_60px_rgba(0,0,0,0.55)]";

/** Quick quote form. Submitting opens WhatsApp with the details pre-filled. */
export function BookingBar({ compact = false, onOpenChange }: { compact?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { t, i18n } = useTranslation("home");
  const id = useId();
  const lang = i18n.resolvedLanguage ?? "en";
  const [service, setService] = useState<Service>("charter");
  const [date, setDate] = useState<Date | undefined>();
  const [pickup, setPickup] = useState("");
  const [guests, setGuests] = useState(2);

  const formatDate = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale(lang), opts).format(d);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prettyDate = date ? formatDate(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
    window.open(
      whatsappLink({ item: t(`booking.services.${service}`), date: prettyDate, pickup, guests }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const field = compact
    ? "flex min-h-11 items-center justify-between gap-4 border-b border-line py-1"
    : "flex min-w-0 flex-col justify-center gap-2 border-r border-line px-7";
  const label = compact ? "label-caps shrink-0 text-[10px] text-mist" : "label-caps text-mist";
  const control = `min-w-0 bg-transparent font-body text-ivory outline-none placeholder:text-fog ${
    compact ? "text-right text-[14px] font-semibold" : "text-[17px] font-medium"
  }`;
  const align = compact ? "end" : "start";

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "flex flex-col gap-2.5 rounded-md border border-ivory/12 bg-surface p-4"
          : "grid h-[104px] grid-cols-[repeat(4,minmax(0,1fr))_240px] rounded-md border border-ivory/12 bg-surface/80 backdrop-blur-[18px]"
      }
    >
      <div className={field}>
        <span id={`${id}-service`} className={label}>
          {t("booking.service")}
        </span>
        <SelectField<Service>
          labelledBy={`${id}-service`}
          value={service}
          options={SERVICES.map((s) => ({ value: s, label: t(`booking.services.${s}`) }))}
          onChange={setService}
          onOpenChange={onOpenChange}
          className={control}
          align={align}
        />
      </div>

      <div className={field}>
        <span id={`${id}-date`} className={label}>
          {t("booking.date")}
        </span>
        <DateField
          labelledBy={`${id}-date`}
          value={date}
          onChange={setDate}
          onOpenChange={onOpenChange}
          placeholder={t("booking.datePlaceholder")}
          display={date ? formatDate(date, compact ? { day: "numeric", month: "short", year: "numeric" } : { weekday: "short", day: "numeric", month: "short" }) : ""}
          locale={CALENDAR_LOCALES[lang as keyof typeof CALENDAR_LOCALES] ?? enUS}
          className={control}
          align={align}
        />
      </div>

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

      <div className={compact ? field : `${field} border-r-0`}>
        <span id={`${id}-guests`} className={label}>
          {t("booking.guests")}
        </span>
        <SelectField<number>
          labelledBy={`${id}-guests`}
          value={guests}
          options={GUESTS.map((n) => ({ value: n, label: String(n) }))}
          onChange={setGuests}
          onOpenChange={onOpenChange}
          className={control}
          align={align}
          columns={compact ? 4 : 2}
        />
      </div>

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

/** The bar's trigger: the current value plus a chevron that flips while open. */
function Trigger({ open, labelledBy, className, children, ...rest }: { open: boolean; labelledBy: string; className: string; children: ReactNode } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-labelledby={labelledBy}
      className={cn("text-left", className, "group/trigger flex w-full cursor-pointer items-center justify-between gap-2", open && "text-gold-hi")}
      {...rest}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronDown className={cn("size-4 shrink-0 text-mist transition-transform duration-300 ease-out-expo", open && "rotate-180 text-gold-hi")} aria-hidden />
    </button>
  );
}

function SelectField<T extends string | number>({
  labelledBy,
  value,
  options,
  onChange,
  onOpenChange,
  className,
  align,
  columns = 1,
}: {
  labelledBy: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  onOpenChange?: (open: boolean) => void;
  className: string;
  align: "start" | "end";
  columns?: number;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (o: boolean) => {
    setOpen(o);
    onOpenChange?.(o);
  };
  const current = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={toggle}>
      <PopoverTrigger asChild>
        <Trigger open={open} labelledBy={labelledBy} className={className} aria-haspopup="listbox">
          {current?.label}
        </Trigger>
      </PopoverTrigger>
      <PopoverContent align={align} sideOffset={14} className={cn(POPOVER, columns === 1 ? "min-w-[240px]" : "")} data-lenis-prevent>
        <ul role="listbox" aria-labelledby={labelledBy} className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  autoFocus={selected}
                  onClick={() => {
                    onChange(o.value);
                    toggle(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2.5 text-left text-[14px] font-medium transition-colors outline-none hover:bg-ivory/[0.06] focus-visible:bg-ivory/[0.06]",
                    columns > 1 && "justify-center px-0 font-code",
                    selected ? "text-gold-hi" : "text-ivory-soft",
                  )}
                >
                  <span className={columns > 1 ? "" : "flex-1"}>{o.label}</span>
                  {selected && columns === 1 ? <Check className="size-4 text-gold-hi" strokeWidth={2} aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function DateField({
  labelledBy,
  value,
  onChange,
  onOpenChange,
  placeholder,
  display,
  locale,
  className,
  align,
}: {
  labelledBy: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder: string;
  display: string;
  locale: typeof enUS;
  className: string;
  align: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const toggle = (o: boolean) => {
    setOpen(o);
    onOpenChange?.(o);
  };
  const today = startOfToday();

  return (
    <Popover open={open} onOpenChange={toggle}>
      <PopoverTrigger asChild>
        <Trigger open={open} labelledBy={labelledBy} className={className} aria-haspopup="dialog">
          {display || <span className="text-fog">{placeholder}</span>}
        </Trigger>
      </PopoverTrigger>
      <PopoverContent align={align} sideOffset={14} className={cn(POPOVER, "p-3")}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange(d);
            if (d) toggle(false);
          }}
          defaultMonth={value ?? today}
          startMonth={today}
          disabled={{ before: today }}
          locale={locale}
          autoFocus
          className="bg-transparent p-0 [--cell-size:--spacing(10)]"
          classNames={{
            month_caption: "flex h-(--cell-size) w-full items-center px-1",
            caption_label: "font-display text-[22px] leading-none font-medium text-ivory capitalize select-none",
            nav: "absolute inset-x-0 top-0 flex items-center justify-end gap-1",
            button_previous:
              "inline-flex size-(--cell-size) cursor-pointer items-center justify-center rounded-full border border-line-strong p-0 text-ivory transition-colors select-none hover:border-ivory aria-disabled:pointer-events-none aria-disabled:opacity-30",
            button_next:
              "inline-flex size-(--cell-size) cursor-pointer items-center justify-center rounded-full border border-gold bg-gold p-0 text-ink transition-[filter] select-none hover:brightness-110 aria-disabled:pointer-events-none aria-disabled:opacity-30",
            weekday: "flex-1 pb-1 font-code text-[11px] font-normal text-fog uppercase select-none",
            day_button:
              "rounded-full font-body text-[14px] font-medium text-ivory-soft hover:bg-ivory/[0.08] hover:text-ivory dark:hover:bg-ivory/[0.08] dark:hover:text-ivory data-[selected-single=true]:bg-gold-hi data-[selected-single=true]:font-bold data-[selected-single=true]:text-ink group-data-[focused=true]/day:ring-gold-hi/40 group-data-[focused=true]/day:border-gold-hi",
            today: "rounded-full [&>button]:text-gold-hi [&>button]:underline [&>button]:decoration-gold/60 [&>button]:underline-offset-4",
            outside: "opacity-40",
            disabled: "pointer-events-none opacity-25",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
