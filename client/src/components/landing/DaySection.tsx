import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { SectionHeading } from "./SectionHeading";

type Stop = { time: string; title: string; text: string };

/** The 12-hour day as a timeline that fills in as you scroll. */
export function DaySection() {
  const { t } = useTranslation("home");
  const stops = (t("day.stops", { returnObjects: true }) as Stop[]) ?? [];
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-stop]"));
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const light = (p: number) =>
        items.forEach((item, i) => item.classList.toggle("is-lit", p >= i / Math.max(1, items.length - 1) - 0.02));
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (c) => {
        const desktop = c.conditions?.desktop;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: desktop ? "top 70%" : "top 75%",
            end: desktop ? "bottom 45%" : "bottom 55%",
            scrub: 0.4,
            invalidateOnRefresh: true,
            onUpdate: (self) => light(self.progress),
          },
        });
        tl.fromTo("[data-day-fill]", desktop ? { scaleX: 0 } : { scaleY: 0 }, desktop ? { scaleX: 1 } : { scaleY: 1 }, 0);
        // The dot rides a full-width track: a transform tween instead of setting `left` on every frame.
        if (desktop) tl.fromTo("[data-day-dot]", { xPercent: 0 }, { xPercent: 100 }, 0);
      });
      light(0);
    }, el);
    return () => ctx.revert();
  }, [stops.length]);

  return (
    <section id="day" className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 py-20 sm:px-8 lg:gap-20 lg:px-20 lg:py-[140px]">
      <SectionHeading eyebrow="day.eyebrow" title="day.title" text="day.text" />

      <div ref={root} className="relative [&_[data-stop].is-lit]:opacity-100">
        {/* Desktop horizontal rail */}
        <div className="absolute top-3 right-0 left-0 hidden h-px bg-line lg:block" />
        <div data-day-fill className="absolute top-[11px] left-0 hidden h-[3px] w-full origin-left bg-[linear-gradient(90deg,#8c6c33,#e8d19a)] lg:block" />
        <div data-day-dot className="pointer-events-none absolute inset-x-0 top-0.5 hidden will-change-transform lg:block">
          <div className="size-[22px] -translate-x-1/2 rounded-full border-2 border-gold-hi bg-ink" />
        </div>
        {/* Mobile vertical rail */}
        <div className="absolute top-1.5 bottom-1.5 left-[6px] w-px bg-line lg:hidden" />
        <div data-day-fill className="absolute top-1.5 bottom-1.5 left-[5px] w-[3px] origin-top bg-[linear-gradient(180deg,#8c6c33,#e8d19a)] lg:hidden" />

        <ol className="grid gap-7 pl-8 lg:grid-cols-6 lg:gap-6 lg:pt-14 lg:pl-0">
          {stops.map((s, i) => (
            <li key={i} data-stop className="flex flex-col gap-1.5 opacity-35 transition-opacity duration-500 lg:gap-3.5 motion-reduce:opacity-100">
              <span className="font-code text-[13px] text-gold-hi lg:text-[14px]">{s.time}</span>
              <h3 className="text-[16px] font-semibold lg:text-[19px]">{s.title}</h3>
              <p className="text-[14px] leading-[1.6] text-mist">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
