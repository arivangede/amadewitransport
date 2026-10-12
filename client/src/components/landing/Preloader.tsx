import { useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const KEY = "amadewi_intro_seen";

function seen() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Once per session: the badge catches a gold sheen, then the curtain lifts. */
export function Preloader() {
  const [done, setDone] = useState(() => seen() || prefersReducedMotion());
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (done || !root.current) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          onComplete: () => {
            try {
              sessionStorage.setItem(KEY, "1");
            } catch {
              /* private mode */
            }
            setDone(true);
          },
        })
        .from("[data-pre-logo]", { autoAlpha: 0, y: 16, duration: 0.7, ease: "expo.out" })
        .fromTo("[data-pre-sheen]", { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: "power2.inOut" }, 0.2)
        .to("[data-pre-logo]", { autoAlpha: 0, y: -12, duration: 0.4, ease: "power2.in" }, 1.1)
        .to(root.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, 1.25);
    }, root);
    return () => ctx.revert();
  }, [done]);

  if (done) return null;

  return (
    <div ref={root} aria-hidden className="fixed inset-0 z-[100] flex items-center justify-center bg-ink">
      <div data-pre-logo className="relative overflow-hidden">
        <img src="/images/logo-adts.png" alt="" className="h-12 w-auto lg:h-16" />
        <span data-pre-sheen className="absolute inset-y-0 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(255,244,214,0.55),transparent)] mix-blend-overlay" />
      </div>
    </div>
  );
}
