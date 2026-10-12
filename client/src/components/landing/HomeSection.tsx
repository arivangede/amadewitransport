import { ArrowUpRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { MAPS_URL } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/** Batubulan — the village the business (and every drive) starts from. */
export function HomeSection() {
  const { t } = useTranslation("home");

  return (
    <section id="home" className="border-t border-[#1c2026]">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-20 lg:py-[100px]">
        <div className="flex flex-col gap-8 lg:col-span-6 lg:pt-10">
          <SectionHeading eyebrow="home.eyebrow" title="home.title" />
          <Reveal delay={0.1}>
            <p className="max-w-[540px] text-[15px] leading-[1.75] text-[#c9c6bf] lg:text-[18px]">{t("home.text")}</p>
          </Reveal>
          <Reveal delay={0.2} className="grid max-w-[540px] grid-cols-2 gap-6 border-t border-line pt-4">
            <div className="flex flex-col gap-1.5 pt-4">
              <span className="label-caps text-mist">{t("home.garage")}</span>
              <span className="text-[14px] leading-[1.5] lg:text-[16px]">
                <Trans ns="home" i18nKey="home.address" components={{ br: <br /> }} />
              </span>
            </div>
            <div className="flex flex-col gap-1.5 pt-4">
              <span className="label-caps text-mist">{t("home.coordinates")}</span>
              <span className="font-code text-[14px] leading-[1.6] text-gold-hi lg:text-[15px]">
                8.6167° S<br />
                115.2609° E
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative h-[480px] overflow-hidden rounded-md border border-line bg-surface lg:col-span-5 lg:col-start-8 lg:h-[700px]">
          <svg viewBox="0 0 500 700" className="absolute inset-0 size-full" role="img" aria-label={t("home.mapLabel")}>
            <path
              d="M70 300 C 110 250, 190 230, 250 240 C 320 250, 380 220, 430 250 C 460 270, 450 320, 420 350 C 390 380, 350 400, 320 440 C 300 470, 260 480, 240 520 C 225 550, 200 560, 185 530 C 175 505, 200 480, 190 455 C 170 420, 120 390, 90 360 C 70 340, 55 320, 70 300 Z"
              fill="#171b21"
              stroke="#3a3f47"
              strokeWidth="1.2"
            />
            <path d="M200 540 C 190 575, 215 600, 240 590" fill="none" stroke="#3a3f47" strokeWidth="1.2" />
            {[
              [262, 300],
              [190, 400],
              [240, 520],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <path d={`M275 395 L ${x} ${y}`} stroke="#c9a45c" strokeWidth="1" strokeDasharray="3 5" className="animate-[dash_2.4s_linear_infinite] motion-reduce:animate-none" />
                <circle cx={x} cy={y} r="4" fill="#a5aab1" />
              </g>
            ))}
            <circle cx="275" cy="395" r="26" fill="none" stroke="#c9a45c" strokeOpacity="0.35" className="origin-[275px_395px] animate-ping motion-reduce:animate-none" />
            <circle cx="275" cy="395" r="8" fill="#e8d19a" />
            <text x="262" y="285" fill="#a5aab1" fontSize="12" fontFamily="Manrope, sans-serif" textAnchor="middle">Kintamani</text>
            <text x="150" y="420" fill="#a5aab1" fontSize="12" fontFamily="Manrope, sans-serif" textAnchor="middle">Seminyak</text>
            <text x="276" y="540" fill="#a5aab1" fontSize="12" fontFamily="Manrope, sans-serif" textAnchor="middle">Uluwatu</text>
            <text x="300" y="390" fill="#e8d19a" fontSize="13" fontWeight="700" letterSpacing="2.3" fontFamily="Manrope, sans-serif">BATUBULAN</text>
          </svg>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-x-5 bottom-5 flex h-14 items-center justify-between rounded border border-line bg-ink px-5 text-[14px] font-semibold text-ivory transition-colors hover:border-gold-hi hover:text-gold-hi lg:inset-x-7 lg:bottom-7"
          >
            {t("home.maps")}
            <ArrowUpRight className="size-[18px]" strokeWidth={1.8} aria-hidden />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
