"use client";

import { motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CharacterSet = string[] | readonly string[];

interface TypingHyperTextProps {
  children: string;
  className?: string;
  /** Delay before starting (ms) */
  delay?: number;
  /** Milliseconds between each typed character */
  typeInterval?: number;
  /** Scramble duration for each new character (ms) */
  scrambleDuration?: number;
  /** Component to render as */
  as?: React.ElementType;
  /** Start animation when in view */
  startOnView?: boolean;
  /** Custom character set for scramble */
  characterSet?: CharacterSet;
  /** Click to restart the animation */
  restartOnClick?: boolean;
  /** Called once after the final character settles */
  onComplete?: () => void;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "abcdefghijklmnopqrstuvwxyz<>|[]{}.,?/+-=_!@#$%^&*()".split(""),
);

export function TypingHyperText({
  children,
  className,
  delay = 0,
  typeInterval = 140,
  scrambleDuration = 350,
  as: Component = "div",
  startOnView = false,
  characterSet = DEFAULT_CHARACTER_SET,
  restartOnClick = true,
  onComplete,
}: TypingHyperTextProps) {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const finalChars = Array.from(children);
  const [visibleCount, setVisibleCount] = useState(0);
  const [scrambledChar, setScrambledChar] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Optionally start on view
  useEffect(() => {
    if (!startOnView) {
      const t = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStarted(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [delay, startOnView]);

  // Typing loop
  useEffect(() => {
    if (!started || visibleCount >= finalChars.length) return;

    const t = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, finalChars.length));
    }, typeInterval);
    return () => clearTimeout(t);
  }, [started, visibleCount, finalChars.length, typeInterval]);

  // Scramble only the most recently typed character
  useEffect(() => {
    if (!started || visibleCount === 0) return;

    const start = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < scrambleDuration) {
        const rand =
          characterSet[Math.floor(Math.random() * characterSet.length)];
        setScrambledChar(rand);
        raf = requestAnimationFrame(tick);
      } else {
        setScrambledChar("");
        if (visibleCount === finalChars.length && !completed) {
          setCompleted(true);
          onComplete?.();
        }
      }
    };
    raf = requestAnimationFrame(tick);
    rafRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [
    started,
    visibleCount,
    scrambleDuration,
    characterSet,
    finalChars.length,
    completed,
    onComplete,
  ]);

  const rendered = finalChars.map((ch, i) => {
    if (i < visibleCount - 1) return ch; // settled
    if (i === visibleCount - 1) {
      if (ch === " ") return ch; // don't scramble spaces
      return scrambledChar || ch; // scrambling
    }
    return ""; // not yet typed
  });

  const restart = () => {
    if (!restartOnClick) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setScrambledChar("");
    setVisibleCount(0);
    setStarted(false);
    setCompleted(false);
    setStarted(true);
  };

  return (
    <MotionComponent
      ref={containerRef}
      className={cn("overflow-hidden py-2 text-4xl font-bold", className)}
      role={restartOnClick ? "button" : undefined}
      tabIndex={restartOnClick ? 0 : undefined}
      onClick={restartOnClick ? restart : undefined}
      onKeyDown={
        restartOnClick
          ? (e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === "Enter" || e.key === " ") restart();
            }
          : undefined
      }
      aria-label={children}
    >
      {rendered.map((c, i) => (
        <span key={i} className={c === " " ? "inline-block w-3" : "font-mono"}>
          {c}
        </span>
      ))}
    </MotionComponent>
  );
}

export default TypingHyperText;
