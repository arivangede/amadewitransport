import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { whatsappLink } from "@/lib/whatsapp";
import { BookingBar } from "./BookingBar";
import { useScrollTo } from "./smooth-scroll";

const INTERVAL = 5; // seconds per slide

type SlideCopy = {
  label: string;
  kicker: string;
  line1: string;
  line2: string;
  text: string;
  cta: string;
  alt: string;
};

// Media per slide; copy comes from i18n (home.hero.slides[n]).
const MEDIA = [
  { src: "/images/hero/lake-temple.jpg", pos: "center 42%", posMobile: "36% center", target: "#contact" },
  { src: "/images/hero/driver-alphard.jpg", pos: "center 58%", posMobile: "44% 30%", target: "#fleet" },
  // Photo: Nick Fewings / Unsplash — mirrored on desktop so the mask sits clear of the copy.
  { src: "/images/hero/barong.jpg", pos: "center 40%", posMobile: "42% 30%", target: "#journeys", flip: true },
  // Photo: Harfian Ananta Daffa / Unsplash
  { src: "/images/hero/airport-gate.jpg", pos: "center 62%", posMobile: "center 30%", whatsapp: "Airport transfer" },
] as const;

export function HeroCarousel() {
  const { t } = useTranslation("home");
  const scrollTo = useScrollTo();
  const slides = (t("hero.slides", { returnObjects: true }) as SlideCopy[]) ?? [];
  const total = MEDIA.length;

  const root = useRef<HTMLElement>(null);
  const indexRef = useRef(0);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const kenBurns = useRef<gsap.core.Tween | null>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const holds = useRef({ user: false, hover: false, focus: false, hidden: false });
  // Lets the progress tween advance slides without a stale closure.
  const goToRef = useRef<(k: number) => void>(() => {});
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);

  const q = useCallback((sel: string) => gsap.utils.toArray<HTMLElement>(root.current?.querySelectorAll(sel) ?? []), []);

  const syncPlayback = useCallback(() => {
    const h = holds.current;
    const hold = h.user || h.hover || h.focus || h.hidden;
    if (!progress.current) return;
    if (hold) progress.current.pause();
    else progress.current.resume();
  }, []);

  const startProgress = useCallback(
    (k: number) => {
      const fills = q("[data-hero-fill]");
      progress.current?.kill();
      gsap.set(fills, { scaleX: 0 });
      progress.current = gsap.fromTo(
        fills[k],
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: INTERVAL,
          ease: "none",
          onComplete: () => goToRef.current((k + 1) % total),
        },
      );
      syncPlayback();
    },
    [q, syncPlayback, total],
  );

  const goTo = useCallback(
    (next: number) => {
      const cur = indexRef.current;
      if (next === cur || !root.current) return;
      const reduce = prefersReducedMotion();
      const bgs = q("[data-hero-bg]");
      const imgs = q("[data-hero-img]");
      const linesOf = (k: number) => q(`[data-hero-slide="${k}"] [data-hero-line]`);

      // Settle any transition still running so layers are in a known state.
      transition.current?.progress(1).kill();
      indexRef.current = next;
      setIndex(next);

      bgs.forEach((bg, k) => {
        if (k !== next && k !== cur) gsap.set(bg, { zIndex: 1, clipPath: "inset(0 100% 0 0)" });
      });
      gsap.set(bgs[cur], { zIndex: 2 });
      gsap.set(bgs[next], { zIndex: 3, clipPath: "inset(0 100% 0 0)" });

      const tl = gsap.timeline();
      if (reduce) {
        tl.set(bgs[next], { clipPath: "inset(0 0% 0 0)", autoAlpha: 0 })
          .to(bgs[next], { autoAlpha: 1, duration: 0.3 })
          .set(linesOf(cur), { yPercent: 130 }, 0)
          .set(linesOf(next), { yPercent: 0 }, 0);
      } else {
        tl.to(bgs[next], { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power4.inOut" }, 0)
          .to(imgs[cur], { xPercent: -5, duration: 1.4, ease: "power4.inOut" }, 0)
          .to(linesOf(cur), { yPercent: -130, duration: 0.6, ease: "power3.in", stagger: 0.04 }, 0)
          .fromTo(linesOf(next), { yPercent: 130 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 }, 0.55);
        kenBurns.current?.kill();
        kenBurns.current = gsap.fromTo(imgs[next], { scale: 1.14, xPercent: 0 }, { scale: 1, duration: INTERVAL + 2, ease: "power1.out" });
      }
      tl.call(() => {
        gsap.set(bgs[cur], { zIndex: 1, clipPath: "inset(0 100% 0 0)" });
        gsap.set(imgs[cur], { xPercent: 0 });
      });
      transition.current = tl;
      startProgress(next);
    },
    [q, startProgress],
  );

  useLayoutEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  // Initial state + intro of the first slide.
  useLayoutEffect(() => {
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const bgs = q("[data-hero-bg]");
      bgs.forEach((bg, k) => gsap.set(bg, { zIndex: k === 0 ? 3 : 1, clipPath: k === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }));
      q("[data-hero-slide]").forEach((s, k) => {
        if (k !== 0) gsap.set(s.querySelectorAll("[data-hero-line]"), { yPercent: 130 });
      });
      if (!reduce) {
        gsap.fromTo(q('[data-hero-slide="0"] [data-hero-line]'), { yPercent: 130 }, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.09, delay: 0.25 });
        kenBurns.current = gsap.fromTo(q("[data-hero-img]")[0], { scale: 1.14 }, { scale: 1, duration: INTERVAL + 3, ease: "power1.out" });
        gsap.from(q("[data-hero-chrome]"), { autoAlpha: 0, y: 24, duration: 1, ease: "expo.out", delay: 0.8, stagger: 0.1 });
      }
      // Auto-rotation is opt-in for reduced motion.
      holds.current.user = reduce;
      setUserPaused(reduce);
      startProgress(0);
    }, root);
    return () => {
      progress.current = null;
      transition.current = null;
      kenBurns.current = null;
      ctx.revert();
    };
  }, [q, startProgress]);

  useEffect(() => {
    const onVis = () => {
      holds.current.hidden = document.hidden;
      syncPlayback();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [syncPlayback]);

  const hold = (key: "hover" | "focus", value: boolean) => {
    holds.current[key] = value;
    syncPlayback();
  };

  const togglePause = () => {
    const next = !holds.current.user;
    holds.current.user = next;
    setUserPaused(next);
    syncPlayback();
  };

  const prev = () => goTo((indexRef.current - 1 + total) % total);
  const next = () => goTo((indexRef.current + 1) % total);

  // Touch swipe
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) (dx < 0 ? next : prev)();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  return (
    <>
      <section
        id="top"
        ref={root}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        className="relative h-[100svh] max-h-[1100px] min-h-[680px] touch-pan-y overflow-hidden lg:min-h-[860px]"
      >
        {/* Photos */}
        <div aria-hidden className="absolute inset-0 isolate overflow-hidden bg-ink">
          {MEDIA.map((m, k) => (
            <div key={m.src} data-hero-bg className="absolute inset-0 overflow-hidden" style={{ zIndex: k === 0 ? 3 : 1, clipPath: k === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}>
              <div className={`absolute inset-0 ${"flip" in m && m.flip ? "lg:-scale-x-100" : ""}`}>
                <img
                  data-hero-img
                  src={m.src}
                  alt=""
                  loading={k === 0 ? "eager" : "lazy"}
                  fetchPriority={k === 0 ? "high" : "auto"}
                  decoding="async"
                  style={{ "--pos": m.pos, "--pos-m": m.posMobile } as React.CSSProperties}
                  className="absolute inset-0 size-full object-cover object-[var(--pos-m)] will-change-transform lg:object-[var(--pos)]"
                />
              </div>
            </div>
          ))}
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,13,16,0.72)_0%,rgba(11,13,16,0.05)_22%,rgba(11,13,16,0.3)_45%,rgba(11,13,16,0.88)_72%,#0b0d10_100%)] lg:bg-[linear-gradient(180deg,rgba(11,13,16,0.72)_0%,rgba(11,13,16,0.12)_28%,rgba(11,13,16,0.35)_60%,#0b0d10_100%)]" />
          <div className="absolute inset-0 z-10 hidden bg-[linear-gradient(90deg,rgba(11,13,16,0.74)_0%,rgba(11,13,16,0.35)_40%,rgba(11,13,16,0)_66%)] lg:block" />
        </div>

        <h1 className="sr-only">{t("hero.srTitle")}</h1>

        {/* Copy */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={t("hero.region")}
          onKeyDown={onKeyDown}
          onMouseEnter={() => hold("hover", true)}
          onMouseLeave={() => hold("hover", false)}
          onFocus={() => hold("focus", true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hold("focus", false)}
          className="absolute inset-x-4 bottom-[104px] z-20 h-[360px] sm:inset-x-8 lg:right-auto lg:bottom-[284px] lg:left-20 lg:h-[480px] lg:w-[min(1100px,calc(100%-160px))]"
        >
          {MEDIA.map((m, k) => {
            const s = slides[k];
            if (!s) return null;
            const active = k === index;
            const ctaClass =
              "inline-flex h-11 items-center gap-2.5 border-b border-gold-hi/50 text-[12px] font-bold tracking-[0.14em] text-gold-hi uppercase transition-colors hover:text-ivory lg:h-[52px] lg:rounded-full lg:border lg:border-gold-hi lg:px-[26px] lg:text-[13px] lg:tracking-[0.12em] lg:hover:bg-gold-hi lg:hover:text-ink";
            return (
              <div
                key={k}
                data-hero-slide={k}
                role="group"
                aria-roledescription="slide"
                aria-label={t("hero.slideOf", { n: k + 1, total, label: s.label })}
                aria-hidden={!active}
                inert={!active}
                className="absolute inset-x-0 bottom-0 flex flex-col gap-4 lg:gap-[26px]"
              >
                <span className="block overflow-hidden">
                  <span data-hero-line className="flex items-center gap-2.5 text-[10px] tracking-[0.28em] text-gold-hi uppercase lg:gap-3.5 lg:text-[12px] lg:tracking-[0.36em]">
                    <span className="h-px w-7 bg-gold lg:w-12" />
                    {s.kicker}
                  </span>
                </span>
                <p className="font-display text-[50px] leading-[0.95] font-normal tracking-[-0.01em] text-[#f4f1ea] sm:text-[72px] lg:text-[clamp(84px,8.2vw,118px)] lg:leading-[0.92] lg:tracking-[-0.02em]" aria-hidden={false}>
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span data-hero-line className="block">
                      {s.line1}
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-[0.1em]">
                    <em data-hero-line className="text-gold block font-normal">
                      {s.line2}
                    </em>
                  </span>
                </p>
                <span className="block overflow-hidden">
                  <span data-hero-line className="block max-w-[560px] text-[15px] leading-[1.6] font-light text-ivory-soft lg:text-[19px]">
                    {s.text}
                  </span>
                </span>
                <span className="block overflow-hidden py-0.5">
                  <span data-hero-line className="block">
                    {"whatsapp" in m ? (
                      <a href={whatsappLink({ item: s.label })} target="_blank" rel="noopener noreferrer" className={ctaClass}>
                        {s.cta}
                        <ArrowRight className="size-4 lg:size-[18px]" strokeWidth={1.8} aria-hidden />
                      </a>
                    ) : (
                      <a
                        href={m.target}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollTo(m.target);
                        }}
                        className={ctaClass}
                      >
                        {s.cta}
                        <ArrowRight className="size-4 lg:size-[18px]" strokeWidth={1.8} aria-hidden />
                      </a>
                    )}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Indicators + controls */}
        <div
          data-hero-chrome
          onMouseEnter={() => hold("hover", true)}
          onMouseLeave={() => hold("hover", false)}
          className="absolute inset-x-4 bottom-7 z-20 flex h-11 items-center gap-1.5 sm:inset-x-8 lg:inset-x-20 lg:bottom-[196px] lg:grid lg:h-16 lg:grid-cols-[repeat(4,minmax(0,1fr))_220px] lg:items-start lg:gap-6"
        >
          {MEDIA.map((_, k) => {
            const label = slides[k]?.label ?? "";
            const active = k === index;
            return (
              <button
                key={k}
                type="button"
                onClick={() => goTo(k)}
                aria-label={t("hero.goTo", { n: k + 1, label })}
                aria-current={active}
                className="flex h-11 flex-1 cursor-pointer flex-col justify-center gap-3 text-left lg:h-12 lg:justify-start"
              >
                <span className="relative block h-0.5 w-full overflow-hidden bg-ivory/20">
                  <span data-hero-fill className="absolute inset-0 origin-left scale-x-0 bg-gold-hi" />
                </span>
                <span className={`hidden items-baseline gap-3 text-[12px] tracking-[0.2em] uppercase transition-colors duration-500 lg:flex ${active ? "text-ivory" : "text-fog"}`}>
                  <span className="font-code tracking-normal">0{k + 1}</span>
                  {label}
                </span>
              </button>
            );
          })}
          <div className="ml-2 flex items-center justify-end gap-2.5 lg:-mt-3.5 lg:ml-0">
            <span className="mr-1.5 font-code text-[12px] whitespace-nowrap text-mist lg:text-[13px]" aria-live="polite">
              0{index + 1} / 0{total}
            </span>
            <button
              type="button"
              onClick={prev}
              aria-label={t("hero.prev")}
              className="hidden size-11 cursor-pointer items-center justify-center rounded-full border border-ivory/30 bg-ink/30 text-ivory transition-colors hover:border-ivory lg:flex"
            >
              <ArrowLeft className="size-[18px]" strokeWidth={1.6} aria-hidden />
            </button>
            <button
              type="button"
              onClick={togglePause}
              aria-label={userPaused ? t("hero.play") : t("hero.pause")}
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ivory/30 bg-ink/35 text-ivory transition-colors hover:border-ivory"
            >
              {userPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M9 5v14M15 5v14" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t("hero.next")}
              className="hidden size-11 cursor-pointer items-center justify-center rounded-full border border-gold bg-gold text-ink transition-[filter] hover:brightness-110 lg:flex"
            >
              <ArrowRight className="size-[18px]" strokeWidth={1.6} aria-hidden />
            </button>
          </div>
        </div>

        {/* Desktop booking bar sits inside the hero */}
        <div data-hero-chrome className="absolute inset-x-20 bottom-14 z-20 hidden lg:block">
          <BookingBar />
        </div>
      </section>

      {/* Mobile booking card sits below it */}
      <div className="px-4 pt-2 pb-10 sm:px-8 lg:hidden">
        <BookingBar compact />
      </div>
    </>
  );
}
