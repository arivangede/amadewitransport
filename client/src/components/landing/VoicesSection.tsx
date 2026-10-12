import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Rich } from "./Rich";
import { Reveal } from "./Reveal";

type Voice = { quote: string; name: string; from: string };

export function VoicesSection() {
  const { t, i18n } = useTranslation("home");
  const items = (t("voices.items", { returnObjects: true }) as Voice[]) ?? [];
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const v = items[i];
  const go = (d: number) => {
    setDir(d);
    setI((x) => (x + d + items.length) % items.length);
  };

  return (
    <section id="voices" className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-20 lg:py-[130px]">
      <Reveal className="flex flex-col gap-6 lg:col-span-4">
        <span className="eyebrow">{t("voices.eyebrow")}</span>
        <h2 className="font-display text-[46px] leading-none font-normal lg:text-[64px]">
          <Rich k="voices.title" />
        </h2>
        <div className="flex gap-3 pt-2 lg:pt-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("voices.prev")}
            className="flex size-[52px] cursor-pointer items-center justify-center rounded-full border border-line-strong text-ivory transition-colors hover:border-ivory"
          >
            <ArrowLeft className="size-5" strokeWidth={1.6} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("voices.next")}
            className="flex size-[52px] cursor-pointer items-center justify-center rounded-full border border-line-strong text-ivory transition-colors hover:border-ivory"
          >
            <ArrowRight className="size-5" strokeWidth={1.6} aria-hidden />
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="lg:col-span-7 lg:col-start-6">
        <figure className="flex flex-col gap-8 lg:gap-10">
          <div className="flex gap-1.5 text-gold-hi" role="img" aria-label={t("voices.rating")}>
            {[0, 1, 2, 3, 4].map((s) => (
              <Star key={s} className="size-5 fill-current" strokeWidth={0} aria-hidden />
            ))}
          </div>
          <div className="relative min-h-[190px] overflow-hidden lg:min-h-[180px]">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              {v ? (
                <motion.blockquote
                  key={i + (i18n.resolvedLanguage ?? "")}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -60 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[28px] leading-[1.25] text-[#f4f1ea] italic lg:text-[46px] lg:leading-[1.2]"
                  aria-live="polite"
                >
                  “{v.quote}”
                </motion.blockquote>
              ) : null}
            </AnimatePresence>
          </div>
          <figcaption className="flex items-center justify-between border-t border-line pt-6">
            <span className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold">{v?.name}</span>
              <span className="text-[13px] text-mist">{v?.from}</span>
            </span>
            <span className="font-code text-[13px] text-mist">
              {String(i + 1).padStart(2, "0")} — {String(items.length).padStart(2, "0")}
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
