import { Clock, Fuel, UserRound } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { intlLocale } from "@/i18n";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ICONS = [UserRound, Fuel, Clock];

type Pillar = { title: string; text: string };
type Stat = { value: number; suffix: string; label: string };

export function StandardSection() {
  const { t, i18n } = useTranslation("home");
  const lang = i18n.resolvedLanguage ?? "en";
  const pillars = (t("standard.pillars", { returnObjects: true }) as Pillar[]) ?? [];
  const stats = (t("standard.stats", { returnObjects: true }) as Stat[]) ?? [];
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const fmt = new Intl.NumberFormat(intlLocale(lang));
    const nodes = el.querySelectorAll<HTMLElement>("[data-count]");
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      nodes.forEach((node) => {
        const target = Number(node.dataset.count);
        const counter = { v: 0 };
        node.textContent = fmt.format(0);
        gsap.to(counter, {
          v: target,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            node.textContent = fmt.format(Math.round(counter.v));
          },
        });
      });
    }, el);
    return () => {
      ctx.revert();
      nodes.forEach((node) => (node.textContent = fmt.format(Number(node.dataset.count))));
    };
  }, [lang]);

  return (
    <section id="standard" className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 py-20 sm:px-8 lg:gap-[88px] lg:px-20 lg:py-[140px]">
      <SectionHeading eyebrow="standard.eyebrow" title="standard.title" text="standard.text" titleClassName="lg:max-w-[820px]" />

      <div className="grid border-t border-line md:grid-cols-3">
        {pillars.map((p, i) => {
          const Icon = ICONS[i] ?? Clock;
          return (
            <Reveal
              key={i}
              delay={i * 0.1}
              className={`flex flex-col gap-4 border-b border-line py-8 md:gap-[22px] md:border-b-0 md:pt-12 ${
                i === 0 ? "md:pr-12" : i === 1 ? "md:border-x md:px-12" : "md:pl-12"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="size-8 text-gold-hi lg:size-10" strokeWidth={1.2} aria-hidden />
                <span className="font-display text-[52px] leading-none text-line lg:text-[72px]" aria-hidden>
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-[20px] font-semibold lg:text-[24px]">{p.title}</h3>
              <p className="text-[15px] leading-[1.7] text-mist lg:text-[16px]">{p.text}</p>
            </Reveal>
          );
        })}
      </div>

      <div key={lang} ref={statsRef} className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="flex flex-col gap-1.5">
            <span className="text-chrome font-display text-[44px] leading-none lg:text-[64px]">
              <span data-count={s.value}>{new Intl.NumberFormat(intlLocale(lang)).format(s.value)}</span>
              {s.suffix}
            </span>
            <span className="label-caps text-[10px] text-mist lg:text-[12px]">{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
