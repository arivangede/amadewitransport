import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

type Mode = "dot" | "link" | "text" | "view";

const SIZE: Record<Mode, { width: number; height: number; radius: number }> = {
  dot: { width: 10, height: 10, radius: 999 },
  link: { width: 34, height: 34, radius: 999 },
  text: { width: 2, height: 24, radius: 1 },
  view: { width: 88, height: 88, radius: 999 },
};

function modeOf(target: Element | null): Mode {
  const el = target?.closest?.('[data-cursor], a, button, [role="button"], [role="option"], input, textarea, select, label');
  if (!el) return "dot";
  if (el.getAttribute("data-cursor") === "view") return "view";
  if (el.matches('textarea, input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])')) return "text";
  return "link";
}

/**
 * Replaces the native pointer with a follower that adapts to what's under it:
 * a dot, a ring over links, a caret over text fields and a labelled disc over
 * [data-cursor="view"]. Mouse only.
 */
export function Cursor() {
  const { t } = useTranslation("home");
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("dot");
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);
  const x = useSpring(useMotionValue(-100), { stiffness: 500, damping: 40, mass: 0.5 });
  const y = useSpring(useMotionValue(-100), { stiffness: 500, damping: 40, mass: 0.5 });

  const enabled = useMediaQuery("(hover: hover) and (pointer: fine)") && !reduce;

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setMode(modeOf(e.target as Element | null));
    };
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = SIZE[mode];
  const disc = mode === "view";

  return (
    <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-[100]" style={{ x, y }}>
      <motion.div
        className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-body text-[11px] font-bold tracking-[0.18em] text-ink uppercase ${
          mode === "link" ? "border border-gold-hi bg-gold-hi/10" : "bg-gold-hi"
        }`}
        animate={{
          width: size.width,
          height: size.height,
          borderRadius: size.radius,
          scale: down ? 0.85 : 1,
          opacity: visible ? (disc ? 1 : 0.9) : 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <motion.span animate={{ opacity: disc ? 1 : 0 }} transition={{ duration: 0.2 }} className="whitespace-nowrap">
          {t("journeys.details")}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
