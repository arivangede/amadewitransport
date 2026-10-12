import { Fragment, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/** Endless destination strip. Scroll velocity speeds it up and skews it; scrolling up reverses it. */
export function Marquee() {
  const { t, i18n } = useTranslation("home");
  const items = (t("marquee.items", { returnObjects: true }) as string[]) ?? [];
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const loop = gsap.to(el, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
      const skew = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3" });
      let direction = 1;
      const settle = gsap
        .delayedCall(0.25, () => {
          gsap.to(loop, { timeScale: direction, duration: 1.2, overwrite: true });
          skew(0);
        })
        .pause();
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          if (self.direction !== direction) direction = self.direction;
          const speed = gsap.utils.clamp(1, 5, 1 + Math.abs(v) / 400);
          gsap.to(loop, { timeScale: speed * direction, duration: 0.3, overwrite: true });
          skew(gsap.utils.clamp(-8, 8, v / -220));
          settle.restart(true);
        },
      });
    }, el);
    return () => ctx.revert();
  }, [i18n.resolvedLanguage]);

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-6 pr-6 lg:gap-12 lg:pr-12" aria-hidden={hidden}>
      {items.map((item, i) => (
        <Fragment key={item + i}>
          <span className={`font-display text-[28px] whitespace-nowrap lg:text-[44px] ${i % 2 === 0 ? "text-ivory italic" : "text-fog"}`}>{item}</span>
          <span className="text-gold" aria-hidden>
            ✦
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <section aria-label={t("marquee.label")} className="flex h-[76px] items-center overflow-hidden border-y border-[#1c2026] lg:h-[120px]">
      <div ref={track} className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
