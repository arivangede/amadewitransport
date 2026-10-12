import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSplitReveal } from "@/hooks/useSplitReveal";
import { Reveal } from "./Reveal";
import { Rich } from "./Rich";

/** Opening block of an inner page: eyebrow, display title and intro, clear of the fixed header. */
export function PageHeader({ page, children }: { page: string; children?: ReactNode }) {
  const { t, i18n } = useTranslation("pages");

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_85%_0%,rgba(201,164,92,0.12),transparent_60%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-8 px-4 pt-[132px] pb-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-20 lg:pt-[200px] lg:pb-24">
        <div className="flex flex-col gap-5 lg:gap-7">
          <Reveal y={12}>
            <span className="eyebrow">{t(`${page}.eyebrow`)}</span>
          </Reveal>
          <Title key={i18n.resolvedLanguage} k={`${page}.title`} />
        </div>
        <Reveal delay={0.15} className="flex flex-col gap-6 lg:mb-3 lg:w-[400px] lg:shrink-0">
          <p className="text-[15px] leading-[1.7] text-mist lg:text-[17px]">{t(`${page}.text`)}</p>
          {children}
        </Reveal>
      </div>
    </header>
  );
}

function Title({ k }: { k: string }) {
  const ref = useSplitReveal<HTMLHeadingElement>();
  return (
    <h1 ref={ref} className="font-display text-[54px] leading-[0.98] font-normal tracking-[-0.01em] text-balance sm:text-[76px] lg:text-[112px] lg:leading-[0.94]">
      <Rich k={k} ns="pages" />
    </h1>
  );
}
