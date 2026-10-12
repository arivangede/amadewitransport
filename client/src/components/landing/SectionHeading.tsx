import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSplitReveal } from "@/hooks/useSplitReveal";
import { Rich } from "./Rich";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  text?: string;
  aside?: ReactNode;
  titleClassName?: string;
}

export function SectionHeading({ eyebrow, title, text, aside, titleClassName = "" }: SectionHeadingProps) {
  const { t, i18n } = useTranslation("home");
  const lang = i18n.resolvedLanguage;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-5 lg:gap-6">
        <Reveal y={12}>
          <span className="eyebrow">{t(eyebrow)}</span>
        </Reveal>
        <HeadingText key={lang} k={title} className={titleClassName} />
      </div>
      {text ? (
        <Reveal delay={0.15} className="lg:mb-3 lg:w-[380px] lg:shrink-0">
          <p className="text-[15px] leading-[1.7] text-mist lg:text-[17px]">{t(text)}</p>
        </Reveal>
      ) : null}
      {aside}
    </div>
  );
}

function HeadingText({ k, className }: { k: string; className: string }) {
  const ref = useSplitReveal<HTMLHeadingElement>();
  return (
    <h2
      ref={ref}
      className={`font-display text-[46px] leading-[1] font-normal tracking-[-0.01em] text-balance sm:text-[64px] lg:text-[84px] lg:leading-[0.98] ${className}`}
    >
      <Rich k={k} />
    </h2>
  );
}
