import { MessageCircle } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { CONTACT_EMAIL, CONTACT_PHONE, whatsappLink } from "@/lib/whatsapp";
import { Magnetic } from "./Magnetic";
import { Rich } from "./Rich";
import { Reveal } from "./Reveal";

export function ReserveSection() {
  const { t } = useTranslation("home");
  const box = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-watermark]",
        { yPercent: 18, scale: 0.92 },
        { yPercent: -18, scale: 1.04, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="px-4 sm:px-8 lg:px-20">
      <section
        id="contact"
        ref={box}
        className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-6 overflow-hidden rounded-lg border border-[#2a2e35] bg-[#14171c] px-5 py-14 text-center lg:min-h-[620px] lg:justify-center lg:gap-9 lg:py-20"
      >
        <img
          data-watermark
          src="/images/logo-adts.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 w-[140%] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        />
        <Reveal y={12} className="relative">
          <span className="eyebrow">{t("reserve.eyebrow")}</span>
        </Reveal>
        <Reveal className="relative">
          <h2 className="font-display text-[54px] leading-[0.95] font-normal lg:text-[120px] lg:leading-[0.92]">
            <Rich k="reserve.title" />
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <p className="max-w-[520px] text-[14px] leading-[1.6] text-mist lg:text-[18px]">{t("reserve.text")}</p>
        </Reveal>
        <Reveal delay={0.2} className="relative flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Magnetic>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-brushed flex h-[60px] items-center gap-3 rounded-full px-8 text-[14px] font-bold tracking-[0.1em] text-ink uppercase transition-[filter] hover:brightness-110"
            >
              <MessageCircle className="size-5" strokeWidth={1.8} aria-hidden />
              {t("common:cta.whatsappShort")}
              <span className="hidden sm:inline">{CONTACT_PHONE}</span>
            </a>
          </Magnetic>
          {CONTACT_EMAIL ? (
            <Magnetic>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex h-[60px] items-center rounded-full border border-line-strong px-8 text-[14px] font-semibold tracking-[0.06em] text-ivory transition-colors hover:border-ivory"
              >
                {CONTACT_EMAIL}
              </a>
            </Magnetic>
          ) : null}
        </Reveal>
      </section>
    </div>
  );
}
