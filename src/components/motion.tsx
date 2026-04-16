"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  animate,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";

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

// ─── MagneticLink — pointer-tracked spring translate ──────────────────────────

interface MagneticLinkProps {
  children: ReactNode;
  className?: string;
  strength?: number; // max pixels of pull (default 6)
  onClick?: () => void;
}

export function MagneticLink({ children, className = "", strength = 6, onClick }: MagneticLinkProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      <motion.span style={{ x: useTransform(sx, (v) => v * 0.4), y: useTransform(sy, (v) => v * 0.4), display: "inline-block" }}>
        {children}
      </motion.span>
    </motion.button>
  );
}

// ─── ScrollProgressBar — page-scroll indicator ────────────────────────────────

export function ScrollProgressBar({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 24, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      style={{
        scaleX,
        transformOrigin: "left",
        background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
        boxShadow: "0 0 10px rgba(0,212,255,0.5)",
      }}
    />
  );
}

// ─── Re-exports for convenience ──────────────────────────────────────────────

export { motion, AnimatePresence };
