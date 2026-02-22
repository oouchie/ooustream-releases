"use client";

import { motion, useMotionValue, useTransform, animate, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

// ─── Shared Easings ──────────────────────────────────────────────────────────

const ease = [0.25, 0.1, 0.25, 1] as const;

// ─── MotionReveal (replaces Reveal + useScrollReveal) ────────────────────────

interface MotionRevealProps {
  children: ReactNode;
  delay?: number; // milliseconds
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  amount?: number;
}

const directionOffset = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 32 },
  right: { x: -32 },
};

export function MotionReveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
  amount = 0.15,
}: MotionRevealProps) {
  const offset = directionOffset[direction];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [...ease] }}
    >
      {children}
    </motion.div>
  );
}

// ─── MotionStagger (parent orchestrator) ─────────────────────────────────────

interface MotionStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number; // seconds
  amount?: number;
}

export function MotionStagger({
  children,
  className = "",
  staggerDelay = 0.08,
  amount = 0.12,
}: MotionStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── MotionStaggerChild ──────────────────────────────────────────────────────

interface MotionStaggerChildProps {
  children: ReactNode;
  className?: string;
}

export function MotionStaggerChild({ children, className = "" }: MotionStaggerChildProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [...ease] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── AnimatedCounter ─────────────────────────────────────────────────────────

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ value, suffix = "", prefix = "", className = "" }: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (isInView) {
      animate(motionVal, value, { duration: 2, ease: [...ease] });
    }
  }, [isInView, motionVal, value]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}

// ─── Re-exports for convenience ──────────────────────────────────────────────

export { motion, AnimatePresence };
