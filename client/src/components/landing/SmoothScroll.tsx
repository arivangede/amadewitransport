import Lenis from "lenis";
import { useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { LenisContext } from "./smooth-scroll";

/** Smooth scroll that also drives ScrollTrigger. Disabled for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    const tick = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Lenis binds to the window, so it can only be created after mount and must be destroyed on unmount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
