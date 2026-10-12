import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronDown, MessageCircle, Minus, Plus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getInclusions, getPricing } from "@/lib/pricing";
import { whatsappLink } from "@/lib/whatsapp";
import type { PackageWithRelations } from "@/store/packageStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLenis } from "./smooth-scroll";

type Tab = "overview" | "inclusions";
const EASE = [0.16, 1, 0.3, 1] as const;

export function PackageModal({ pkg, onClose }: { pkg: PackageWithRelations | null; onClose: () => void }) {
  const lenis = useLenis();
  // Keep the last package around so the exit animation still has content.
  const [shown, setShown] = useState<PackageWithRelations | null>(pkg);
  if (pkg && pkg !== shown) setShown(pkg);

  useEffect(() => {
    if (!pkg) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [pkg, lenis]);

  return (
    <Dialog.Root open={!!pkg} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>{pkg && shown ? <ModalBody key={shown.id} pkg={shown} /> : null}</AnimatePresence>
    </Dialog.Root>
  );
}

function ModalBody({ pkg }: { pkg: PackageWithRelations }) {
  const { t, i18n } = useTranslation("packages");
  const reduce = useReducedMotion();
  const lang = i18n.resolvedLanguage ?? "en";
  const pricing = getPricing(pkg, lang);
  const inclusions = getInclusions(pkg.inclusions);
  const images = (pkg.images ?? []).map((i) => i.path).filter(Boolean);
  const [img, setImg] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const [guests, setGuests] = useState(2);

  const tabs: Tab[] = inclusions.length ? ["overview", "inclusions"] : ["overview"];
  const step = (d: number) => images.length && setImg((i) => (i + d + images.length) % images.length);

  const [touch, setTouch] = useState<number | null>(null);

  return (
    <Dialog.Portal forceMount>
      <Dialog.Overlay asChild forceMount>
        <motion.div
          className="fixed inset-0 z-[70] bg-[rgba(8,9,12,0.78)] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </Dialog.Overlay>
      <Dialog.Content asChild forceMount aria-describedby={undefined}>
        <motion.div
          data-lenis-prevent
          className="landing fixed inset-x-0 bottom-0 z-[71] flex max-h-[100dvh] flex-col overflow-y-auto overscroll-contain rounded-t-2xl border border-[#2a2e35] bg-surface shadow-[0_60px_120px_rgba(0,0,0,0.55)] outline-none lg:inset-auto lg:top-1/2 lg:left-1/2 lg:grid lg:h-[min(880px,calc(100dvh-64px))] lg:w-[min(1200px,calc(100vw-64px))] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:overflow-hidden lg:rounded-[10px]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* Gallery */}
          <div
            className="flex shrink-0 flex-col gap-3 bg-[#0e1014] p-3 lg:min-h-0"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
            onTouchStart={(e) => setTouch(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch === null) return;
              const dx = e.changedTouches[0].clientX - touch;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              setTouch(null);
            }}
          >
            <div className="relative h-[46vh] max-h-[420px] min-h-[260px] overflow-hidden rounded-md lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-1">
              <AnimatePresence initial={false} mode="popLayout">
                {images.length ? (
                  <motion.img
                    key={images[img]}
                    src={images[img]}
                    alt={t("gallery", { n: img + 1, total: images.length })}
                    className="absolute inset-0 size-full object-cover"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-well">
                    <img src="/images/logo-adts.png" alt="" className="w-1/2 opacity-10" />
                  </div>
                )}
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(14,16,20,0),rgba(14,16,20,0.85))]" />
              <span className="absolute top-5 left-5 rounded-full bg-gold px-3.5 py-2 text-[10px] font-bold tracking-[0.2em] text-ink uppercase lg:text-[11px]">
                {t("eyebrow")}
              </span>
              {images.length > 1 ? (
                <span className="absolute right-5 bottom-5 font-code text-[13px] text-ivory">
                  {String(img + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="grid h-16 shrink-0 grid-cols-4 gap-3 lg:h-24">
                {images.slice(0, 4).map((src, k) => (
                  <button
                    key={src + k}
                    type="button"
                    onClick={() => setImg(k)}
                    aria-label={t("gallery", { n: k + 1, total: images.length })}
                    aria-pressed={k === img}
                    className={`cursor-pointer overflow-hidden rounded border bg-raised p-0 transition-opacity ${
                      k === img ? "border-2 border-gold-hi opacity-100" : "border-line opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Details: fixed header, tabs and booking; only the tab content flexes to fit the height left. */}
          <div className="flex min-w-0 flex-col px-5 pt-6 pb-6 lg:grid lg:min-h-0 lg:grid-rows-[auto_auto_auto_minmax(0,1fr)_auto] lg:overflow-hidden lg:px-11 lg:pt-8 lg:pb-6">
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="font-display text-[34px] leading-[1.02] font-medium text-ivory lg:text-[40px]">{pkg.name}</Dialog.Title>
              <div className="flex shrink-0 items-center gap-3">
                <LanguageSwitcher size="sm" />
                <Dialog.Close
                  aria-label={t("close")}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ivory transition-colors hover:border-ivory"
                >
                  <X className="size-[18px]" strokeWidth={1.8} aria-hidden />
                </Dialog.Close>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 border-y border-line">
              {(["duration", "vehicle", "fuel"] as const).map((k) => (
                <div key={k} className="flex flex-col gap-1 py-3 pr-3">
                  <dt className="label-caps text-[10px] text-fog">{t(`meta.${k}`)}</dt>
                  <dd className="text-[14px] font-semibold text-ivory lg:text-[15px]">{t(`meta.${k}Value`)}</dd>
                </div>
              ))}
            </dl>

            <div role="tablist" aria-label={t("tabsLabel")} className="mt-3 flex gap-8 border-b border-line">
              {tabs.map((k) => (
                <button
                  key={k}
                  id={`pkg-tab-${k}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  aria-controls={`pkg-panel-${k}`}
                  onClick={() => setTab(k)}
                  className={`relative -mb-px h-11 cursor-pointer text-[14px] font-semibold tracking-[0.06em] transition-colors ${tab === k ? "text-ivory" : "text-fog hover:text-ivory"}`}
                >
                  {t(`tabs.${k}`)}
                  {tab === k ? <motion.span layoutId="pkg-tab-underline" className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-hi" /> : null}
                </button>
              ))}
            </div>

            <TabPanel id={`pkg-panel-${tab}`} labelledBy={`pkg-tab-${tab}`} resetKey={tab + lang} moreLabel={t("readMore")}>
              {tab === "overview" ? (
                <p className="text-[15px] leading-[1.7] whitespace-pre-line text-[#c9c6bf]">{pkg.description || t("noDescription")}</p>
              ) : (
                <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {inclusions.map((inc, i) => (
                    <li key={i} className="flex gap-2.5 text-[14px] leading-[1.45]">
                      <Check className="mt-[3px] size-4 shrink-0 text-gold-hi" strokeWidth={2} aria-hidden />
                      <span>
                        <span className="text-ivory">{inc.item}</span>
                        {inc.description ? <span className="block text-[13px] text-mist">{inc.description}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </TabPanel>

            {/* Booking: price and guests share a row, the CTA spans below. */}
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-4 rounded-md border border-line bg-raised p-4 lg:gap-y-3 lg:p-4 lg:pl-5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="label-caps text-[10px] whitespace-nowrap text-fog">{t("common:price.perCar")}</span>
                  <span className="text-[24px] leading-tight font-bold whitespace-nowrap text-gold-hi">{pricing.formatted}</span>
                  {pricing.hasDiscount ? (
                    <span className="flex items-center gap-2">
                      <span className="text-[12px] whitespace-nowrap text-fog line-through">{pricing.formattedBase}</span>
                      <span className="rounded-full bg-promo px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] whitespace-nowrap text-promo-fg uppercase">
                        −{pricing.discountLabel}
                      </span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-line-strong p-1">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    aria-label={t("fewer")}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#22262d] text-ivory disabled:opacity-40"
                    disabled={guests <= 1}
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="min-w-[84px] text-center text-[14px] font-semibold" aria-live="polite">
                    {t("guests", { count: guests })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(14, g + 1))}
                    aria-label={t("more")}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#22262d] text-ivory disabled:opacity-40"
                    disabled={guests >= 14}
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
                <a
                  href={whatsappLink({ item: pkg.name, discount: pricing.hasDiscount ? pricing.discountLabel : undefined, guests })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold-brushed col-span-2 flex h-14 items-center justify-center gap-2.5 rounded-full px-5 text-[13px] font-bold tracking-[0.1em] whitespace-nowrap text-ink uppercase transition-[filter] hover:brightness-110 lg:h-12"
                >
                  <MessageCircle className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
                  {t("cta")}
                </a>
              </div>
              <p className="text-center text-[12px] text-fog">{t("fine")}</p>
            </div>
          </div>
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/**
 * Tab content sized to the space left in the dialog. When it doesn't fit, it fades out with a
 * "Read more" that lets that panel scroll — the common case never needs a scrollbar.
 */
function TabPanel({ id, labelledBy, resetKey, moreLabel, children }: { id: string; labelledBy: string; resetKey: string; moreLabel: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prevKey, setPrevKey] = useState(resetKey);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    setExpanded(false);
  }

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setOverflow(el.scrollHeight > el.clientHeight + 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [resetKey]);

  const clipped = overflow && !expanded;

  return (
    <div role="tabpanel" id={id} aria-labelledby={labelledBy} className="relative min-h-[120px] pt-4 lg:min-h-0">
      <div
        ref={box}
        data-lenis-prevent
        className={`h-full overscroll-contain ${expanded ? "overflow-y-auto pr-2" : "overflow-hidden"} ${
          clipped ? "[mask-image:linear-gradient(180deg,#000_calc(100%-72px),transparent)]" : ""
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={resetKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      {clipped ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute bottom-0 left-0 inline-flex h-8 cursor-pointer items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-gold-hi uppercase transition-colors hover:text-ivory"
        >
          {moreLabel}
          <ChevronDown className="size-4" strokeWidth={1.8} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
