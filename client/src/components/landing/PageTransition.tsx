import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useOutlet } from "react-router-dom";
import { EASE, gsap, prefersReducedMotion, ScrollTrigger, SplitText } from "@/lib/gsap";
import { PAGES } from "./pages";
import { useLenis, useScrollTo } from "./smooth-scroll";

type Shown = { pathname: string; hash: string; element: ReactNode };

/**
 * Renders the page for the current route behind a curtain: on navigation the curtain rises over the old
 * page carrying the next page's name, the new one is swapped in while hidden, then the curtain lifts. The URL updates straight away;
 * only what's on screen waits. Pinned ScrollTrigger sections never share the DOM this way.
 */
export function PageTransition() {
  const { t } = useTranslation("common");
  const location = useLocation();
  const outlet = useOutlet();
  const lenis = useLenis();
  const [shown, setShown] = useState<Shown>(() => ({ pathname: location.pathname, hash: location.hash, element: outlet }));
  // Bumped when a transition finishes, so a navigation made mid-transition gets its own turn.
  const [settled, setSettled] = useState(0);
  const curtain = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLElement>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const busy = useRef(false);
  const latest = useRef({ location, outlet, lenis, t });
  useLayoutEffect(() => {
    latest.current = { location, outlet, lenis, t };
  });

  // Reduced motion: swap on the spot.
  if (location.pathname !== shown.pathname && prefersReducedMotion()) {
    setShown({ pathname: location.pathname, hash: location.hash, element: outlet });
  }

  useLayoutEffect(() => {
    const el = curtain.current;
    if (busy.current || !el || location.pathname === shown.pathname) return;
    busy.current = true;
    latest.current.lenis?.stop();

    // Whatever the URL is once the curtain is down wins — fast double clicks land on the last page.
    const swap = () => {
      const { location, outlet } = latest.current;
      setShown({ pathname: location.pathname, hash: location.hash, element: outlet });
    };

    ctx.current?.revert();
    const page = PAGES.findIndex((p) => p.to === location.pathname);
    const title = el.querySelector<HTMLElement>("[data-pt-title]")!;
    const index = el.querySelector<HTMLElement>("[data-pt-index]")!;
    title.textContent = page >= 0 ? latest.current.t(PAGES[page].key) : "Amadewi Trans";
    index.textContent = page >= 0 ? `0${page + 1} / 0${PAGES.length}` : "";

    ctx.current = gsap.context(() => {
      const { chars } = SplitText.create(title, { type: "chars", mask: "chars" });
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(el, { visibility: "hidden" });
            busy.current = false;
            ScrollTrigger.refresh();
            main.current?.focus({ preventScroll: true });
            setSettled((n) => n + 1);
          },
        })
        .set(el, { visibility: "visible", yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.5, ease: EASE.wipe })
        .from(chars, { yPercent: 110, rotate: 8, duration: 0.7, ease: EASE.reveal, stagger: 0.035 }, 0.25)
        .fromTo(index, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.reveal }, 0.3)
        .fromTo("[data-pt-rule]", { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.7, ease: EASE.wipe }, 0.35)
        .call(swap, [], 0.5)
        .to(chars, { yPercent: -110, duration: 0.4, ease: "power3.in", stagger: 0.02 }, 1)
        .to([index, "[data-pt-rule]"], { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 1)
        .call(() => latest.current.lenis?.start(), [], 1.15)
        .to(el, { yPercent: -100, duration: 0.6, ease: EASE.wipe }, 1.15);
    }, el);
  }, [location.pathname, shown.pathname, settled]);

  useLayoutEffect(() => () => ctx.current?.revert(), []);

  // The name drifts after the pointer while the curtain is up.
  useLayoutEffect(() => {
    if (!stage.current || prefersReducedMotion()) return;
    const x = gsap.quickTo(stage.current, "x", { duration: 0.8, ease: "power3.out" });
    const y = gsap.quickTo(stage.current, "y", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      if (!busy.current) return;
      x((e.clientX / window.innerWidth - 0.5) * 60);
      y((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Same-page hash links follow the URL; mid-transition the hash stays with the page on screen.
  const hash = location.pathname === shown.pathname ? location.hash : shown.hash;

  return (
    <>
      <RouteScroll pathname={shown.pathname} hash={hash} />
      <main ref={main} tabIndex={-1} className="outline-none">
        {shown.element}
      </main>
      <div ref={curtain} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[90] flex items-center justify-center bg-ink">
        <div ref={stage} className="flex flex-col items-center gap-6 px-4 text-center">
          <span data-pt-index className="font-code text-[12px] tracking-[0.3em] text-gold" />
          <span data-pt-title className="font-display text-[clamp(64px,14vw,200px)] leading-[0.95] text-ivory" />
          <span data-pt-rule className="h-px w-[min(320px,60vw)] origin-left bg-gold-hi" />
        </div>
      </div>
    </>
  );
}

/** New page on screen → start at the top; `/#section` → land on that section once the page has measured itself. */
function RouteScroll({ pathname, hash }: { pathname: string; hash: string }) {
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const latest = useRef({ lenis, scrollTo });
  useLayoutEffect(() => {
    latest.current = { lenis, scrollTo };
  });

  useLayoutEffect(() => {
    const { lenis } = latest.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    if (!hash) return;

    // Pinned sections are built after their data loads, which moves everything below them — so go
    // there after the first frame and again after the next ScrollTrigger refresh.
    const go = () => latest.current.scrollTo(hash);
    const raf = requestAnimationFrame(go);
    ScrollTrigger.addEventListener("refresh", go);
    const stop = setTimeout(() => ScrollTrigger.removeEventListener("refresh", go), 2000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stop);
      ScrollTrigger.removeEventListener("refresh", go);
    };
  }, [pathname, hash]);

  return null;
}
