import type Lenis from "lenis";
import { createContext, useContext } from "react";

export const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

/** Scrolls to an in-page anchor or offset, through Lenis when it's running. */
export function useScrollTo() {
  const lenis = useLenis();
  return (target: string | number) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };
}
