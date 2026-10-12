import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

/** A small follower that grows into a "View" disc over [data-cursor="view"]. Mouse only. */
export function Cursor() {
  const { t } = useTranslation("home");
  const reduce = useReducedMotion();
  const [view, setView] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useSpring(useMotionValue(-100), { stiffness: 500, damping: 40, mass: 0.5 });
  const y = useSpring(useMotionValue(-100), { stiffness: 500, damping: 40, mass: 0.5 });

  const enabled = useMediaQuery("(hover: hover) and (pointer: fine)") && !reduce;

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setView(!!(e.target as Element | null)?.closest?.('[data-cursor="view"]'));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-[80]" style={{ x, y }}>
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-gold-hi text-[11px] font-bold tracking-[0.18em] text-ink uppercase"
        animate={{ width: view ? 88 : 10, height: view ? 88 : 10, opacity: visible ? (view ? 1 : 0.9) : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <motion.span animate={{ opacity: view ? 1 : 0 }} transition={{ duration: 0.2 }}>
          {t("journeys.details")}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
