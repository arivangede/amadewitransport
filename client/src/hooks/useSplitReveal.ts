import { useLayoutEffect, useRef } from "react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

/** Masked line-by-line reveal of a heading when it scrolls into view. */
export function useSplitReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.2,
            stagger: 0.09,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return ref;
}
