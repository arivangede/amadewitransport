import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ScrollTrigger } from "@/lib/gsap";
import { useScrollTo } from "./smooth-scroll";

const HOME_SECTIONS = ["top", "standard", "fleet", "day", "journeys", "voices", "home", "contact"] as const;

/**
 * Floating table of contents on the right edge of the home page. Each bar fills as you read its
 * section; hovering unfolds the labels, clicking scrolls there. Desktop only.
 */
export function SectionIndicator() {
  const { t } = useTranslation("common");
  const scrollTo = useScrollTo();
  const [params] = useSearchParams();
  const [active, setActive] = useState(0);
  // The current label shows briefly when the section changes, then folds away until hovered.
  const [flashing, setFlashing] = useState(-1);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const flash = flashing === active;

  useEffect(() => {
    if (flashing < 0) return;
    const id = setTimeout(() => setFlashing(-1), 1600);
    return () => clearTimeout(id);
  }, [flashing]);

  useLayoutEffect(() => {
    const els = HOME_SECTIONS.map((id) => document.getElementById(id));
    // Each section runs until the next one starts — so a pinned section counts its pin distance too.
    const triggers = els.map((el, i) => {
      if (!el) return null;
      const next = els.slice(i + 1).find(Boolean);
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        ...(next ? { endTrigger: next, end: "top 55%" } : { end: "max" }),
        onToggle: (self) => {
          if (!self.isActive) return;
          setActive(i);
          setFlashing(i);
        },
        onUpdate: (self) => {
          const fill = fills.current[i];
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
        onRefresh: (self) => {
          const fill = fills.current[i];
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
      });
    });
    return () => triggers.forEach((st) => st?.kill());
  }, []);

  const hidden = active === 0 || params.has("journey");

  return (
    <nav
      aria-label={t("sections.label")}
      className={`group/toc fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 pr-5 transition-[opacity,translate] duration-700 ease-out-expo lg:block xl:pr-7 ${
        hidden ? "pointer-events-none translate-x-6 opacity-0" : "opacity-100"
      }`}
    >
      {/* Legibility scrim, only while unfolded. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[-24px] right-0 -left-16 bg-[linear-gradient(270deg,rgba(11,13,16,0.92)_35%,rgba(11,13,16,0))] opacity-0 transition-opacity duration-500 group-hover/toc:opacity-100 group-focus-within/toc:opacity-100"
      />
      <ol className="relative flex flex-col items-end gap-1">
        {HOME_SECTIONS.map((id, i) => {
          const current = i === active;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(id === "top" ? 0 : `#${id}`);
                }}
                aria-current={current ? "location" : undefined}
                className="group/item flex h-7 items-center justify-end gap-3"
              >
                <span
                  style={{ transitionDelay: `${i * 30}ms` }}
                  className={`flex items-baseline gap-2 text-[11px] font-semibold tracking-[0.2em] whitespace-nowrap uppercase transition-[opacity,translate,color] duration-500 ease-out-expo group-hover/toc:translate-x-0 group-hover/toc:opacity-100 group-focus-within/toc:translate-x-0 group-focus-within/toc:opacity-100 ${
                    current ? `text-gold-hi ${flash ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"}` : "translate-x-3 text-mist opacity-0 group-hover/item:text-ivory"
                  }`}
                >
                  <span className="font-code text-[10px] tracking-normal text-fog">{String(i + 1).padStart(2, "0")}</span>
                  {t(`sections.${id}`)}
                </span>
                <span
                  className={`relative block h-[2px] overflow-hidden rounded-full bg-ivory/20 transition-[width,background-color] duration-500 ease-out-expo group-hover/item:bg-ivory/40 ${
                    current ? "w-10" : "w-5 group-hover/item:w-7"
                  }`}
                >
                  <span
                    ref={(el) => {
                      fills.current[i] = el;
                    }}
                    className="absolute inset-0 origin-left scale-x-0 bg-gold-hi"
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
