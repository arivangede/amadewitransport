import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const URL = "https://arivansatria.com";

// "arvn" are the initials kept from "arivansatria.com"; the rest unfolds on hover.
const SEGMENTS = [
  { text: "ar", hidden: false },
  { text: "i", hidden: true },
  { text: "v", hidden: false },
  { text: "a", hidden: true },
  { text: "n", hidden: false },
  { text: "satria.com", hidden: true },
];

/** Maker's watermark: "built by arvn" unfolds into "find me at arivansatria.com ↗". */
export function MakerMark() {
  const { t } = useTranslation("common");
  let hiddenIndex = 0;

  return (
    <a
      href={URL}
      target="_blank"
      rel="noopener"
      aria-label={t("maker.label")}
      className="group/maker inline-flex items-baseline gap-[0.5em] self-start font-code text-[12px] tracking-[0.04em] text-fog lowercase outline-offset-4 sm:self-auto"
    >
      {/* Both prefixes share one grid cell; they roll past each other. */}
      <span aria-hidden className="inline-grid justify-items-end overflow-hidden">
        <span className="col-start-1 row-start-1 transition-transform duration-500 ease-out-expo group-hover/maker:-translate-y-full group-focus-visible/maker:-translate-y-full">
          {t("maker.built")}
        </span>
        <span className="col-start-1 row-start-1 translate-y-full text-mist transition-transform duration-500 ease-out-expo group-hover/maker:translate-y-0 group-focus-visible/maker:translate-y-0">
          {t("maker.find")}
        </span>
      </span>

      <span aria-hidden className="inline-flex items-baseline font-semibold text-ivory-soft transition-colors duration-500 group-hover/maker:text-gold-hi group-focus-visible/maker:text-gold-hi">
        {SEGMENTS.map((s, i) => {
          if (!s.hidden) return <span key={i}>{s.text}</span>;
          const delay = 60 + hiddenIndex++ * 70;
          return (
            // A 0fr → 1fr grid column animates the letters' natural width in.
            <span
              key={i}
              style={{ transitionDelay: `${delay}ms` }}
              className="inline-grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-500 ease-out-expo group-hover/maker:grid-cols-[1fr] group-hover/maker:opacity-100 group-focus-visible/maker:grid-cols-[1fr] group-focus-visible/maker:opacity-100"
            >
              <span className="min-w-0 overflow-hidden">{s.text}</span>
            </span>
          );
        })}
        <ArrowUpRight
          className="ml-0.5 size-3.5 -translate-x-1 translate-y-0.5 self-center text-gold-hi opacity-0 transition-[opacity,translate] delay-200 duration-500 ease-out-expo group-hover/maker:translate-x-0 group-hover/maker:translate-y-0 group-hover/maker:opacity-100 group-focus-visible/maker:translate-x-0 group-focus-visible/maker:translate-y-0 group-focus-visible/maker:opacity-100"
          strokeWidth={2}
        />
      </span>
    </a>
  );
}
