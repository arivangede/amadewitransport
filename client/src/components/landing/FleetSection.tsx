import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getPricing } from "@/lib/pricing";
import { whatsappLink } from "@/lib/whatsapp";
import type { UnitWithRelations } from "@/store/unitStore";
import { useUnits } from "@/hooks/useLandingData";
import { SectionHeading } from "./SectionHeading";
import { useScrollTo } from "./smooth-scroll";

export function FleetSection() {
  const { t } = useTranslation("home");
  const { data: units = [], isLoading, isError } = useUnits();
  const scrollTo = useScrollTo();
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const count = units.length;

  const setProgress = (p: number) => {
    if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.04, p)})`;
    setActive(Math.min(count - 1, Math.max(0, Math.round(p * (count - 1)))));
  };

  useLayoutEffect(() => {
    if (!count || !section.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      if (prefersReducedMotion()) return;
      const distance = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      if (distance() <= 0) return;
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        },
      });
      trigger.current = tween.scrollTrigger ?? null;
      return () => {
        trigger.current = null;
      };
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const onNativeScroll = () => {
    const el = viewport.current;
    if (!el || trigger.current) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  const step = (dir: 1 | -1) => {
    const target = Math.min(count - 1, Math.max(0, active + dir));
    const st = trigger.current;
    if (st) {
      scrollTo(st.start + (st.end - st.start) * (count > 1 ? target / (count - 1) : 0));
      return;
    }
    const card = track.current?.children[target] as HTMLElement | undefined;
    if (card) viewport.current?.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <section id="fleet" ref={section} className="overflow-hidden bg-[#111419]">
      <div className="flex flex-col justify-center gap-10 py-20 lg:h-svh lg:min-h-[800px] lg:gap-16 lg:py-0">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-20">
          <SectionHeading
            eyebrow="fleet.eyebrow"
            title="fleet.title"
            aside={
              count > 1 ? (
                <div className="flex items-center gap-4 lg:gap-6">
                  <span className="font-code text-[13px] text-mist" aria-live="polite">
                    {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                  <div className="relative h-0.5 w-32 bg-line lg:w-[220px]">
                    <div ref={bar} className="absolute inset-0 origin-left bg-gold" style={{ transform: `scaleX(${1 / count})` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={t("fleet.prev")}
                    className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ivory transition-colors hover:border-ivory lg:size-14"
                  >
                    <ArrowLeft className="size-5" strokeWidth={1.6} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={t("fleet.next")}
                    className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-gold bg-gold text-ink transition-[filter] hover:brightness-110 lg:size-14"
                  >
                    <ArrowRight className="size-5" strokeWidth={1.6} aria-hidden />
                  </button>
                </div>
              ) : null
            }
          />
        </div>

        <div
          ref={viewport}
          onScroll={onNativeScroll}
          data-lenis-prevent-wheel
          className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:snap-none lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          <div ref={track} className="flex w-max gap-4 px-4 will-change-transform sm:px-8 lg:gap-8 lg:px-20">
            {isLoading
              ? [0, 1, 2].map((i) => <div key={i} className="h-[420px] w-[82vw] max-w-[380px] animate-pulse rounded bg-raised lg:h-[560px] lg:w-[480px] lg:max-w-none" />)
              : null}
            {!isLoading && (isError || !count) ? (
              <p className="max-w-md py-10 text-[15px] text-mist">{isError ? t("common:state.error") : t("common:state.empty")}</p>
            ) : null}
            {units.map((u, i) => (
              <UnitCard key={u.id} unit={u} featured={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UnitCard({ unit, featured }: { unit: UnitWithRelations; featured: boolean }) {
  const { t, i18n } = useTranslation("home");
  const lang = i18n.resolvedLanguage ?? "en";
  const pricing = getPricing(unit, lang);
  const image = unit.images?.[0]?.path;

  return (
    <article
      data-cursor="view"
      className={`group flex w-[82vw] max-w-[380px] shrink-0 snap-start flex-col gap-5 lg:max-w-none lg:gap-7 ${featured ? "lg:w-[620px]" : "lg:w-[440px]"}`}
    >
      <div className="relative h-[300px] overflow-hidden rounded bg-raised lg:h-[460px]">
        {image ? (
          <img
            src={image}
            alt={unit.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex size-full flex-col justify-between border border-line p-7">
            <span className="label-caps text-mist">{t("fleet.noPhoto")}</span>
            <span className="font-display text-[88px] leading-[0.85] text-[#1f242b] lg:text-[120px]">{unit.name.split(" ").slice(-1)[0]}</span>
          </div>
        )}
        {pricing.hasDiscount ? (
          <span className="absolute top-5 left-5 rounded-full bg-promo px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-promo-fg uppercase">
            {t("common:price.promo")} −{pricing.discountLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-display leading-none font-medium ${featured ? "text-[34px] lg:text-[44px]" : "text-[30px] lg:text-[36px]"}`}>{unit.name}</h3>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="label-caps text-[10px] text-mist">{t("common:price.from")}</span>
            <span className="text-[18px] font-semibold whitespace-nowrap text-gold-hi lg:text-[22px]">{pricing.formatted}</span>
            {pricing.hasDiscount ? <span className="text-[12px] text-fog line-through">{pricing.formattedBase}</span> : null}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 text-[14px] text-mist">
          <span className="flex gap-3">
            <span>{t("fleet.seats", { count: unit.capacity })}</span>
            <span aria-hidden>·</span>
            <span>{unit.year}</span>
          </span>
          <a
            href={whatsappLink({ item: unit.name, discount: pricing.hasDiscount ? pricing.discountLabel : undefined })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-ivory uppercase transition-colors hover:text-gold-hi"
          >
            {t("fleet.book")}
            <ArrowUpRight className="size-4" strokeWidth={1.8} aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
