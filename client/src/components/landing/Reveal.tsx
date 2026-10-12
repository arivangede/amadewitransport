import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ delay = 0, y = 32, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.2 : 1, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
