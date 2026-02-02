"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "zoom-out" | "flip-up" | "flip-down";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Small delay to ensure CSS is applied before observing
    const initTimer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasAnimated(true);
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once && hasAnimated) {
            setIsVisible(false);
          }
        },
        {
          threshold,
          rootMargin: "0px 0px -80px 0px"
        }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(initTimer);
  }, [threshold, once, hasAnimated]);

  const animationStyles: Record<string, { hidden: React.CSSProperties; visible: React.CSSProperties }> = {
    "fade-up": {
      hidden: { opacity: 0, transform: "translateY(30px)" },
      visible: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-down": {
      hidden: { opacity: 0, transform: "translateY(-30px)" },
      visible: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-left": {
      hidden: { opacity: 0, transform: "translateX(-30px)" },
      visible: { opacity: 1, transform: "translateX(0)" },
    },
    "fade-right": {
      hidden: { opacity: 0, transform: "translateX(30px)" },
      visible: { opacity: 1, transform: "translateX(0)" },
    },
    "zoom-in": {
      hidden: { opacity: 0, transform: "scale(0.9)" },
      visible: { opacity: 1, transform: "scale(1)" },
    },
    "zoom-out": {
      hidden: { opacity: 0, transform: "scale(1.1)" },
      visible: { opacity: 1, transform: "scale(1)" },
    },
    "flip-up": {
      hidden: { opacity: 0, transform: "perspective(1000px) rotateX(10deg) translateY(20px)" },
      visible: { opacity: 1, transform: "perspective(1000px) rotateX(0) translateY(0)" },
    },
    "flip-down": {
      hidden: { opacity: 0, transform: "perspective(1000px) rotateX(-10deg) translateY(-20px)" },
      visible: { opacity: 1, transform: "perspective(1000px) rotateX(0) translateY(0)" },
    },
  };

  const currentAnimation = animationStyles[animation] || animationStyles["fade-up"];
  const currentStyle = isVisible ? currentAnimation.visible : currentAnimation.hidden;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...currentStyle,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// Counter animation for stats
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

// Stagger children animations
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in";
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 100,
  animation = "fade-up",
}: StaggerContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(element);
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getAnimationStyle = (index: number) => {
    const baseHidden = { opacity: 0 };
    const baseVisible = { opacity: 1 };

    const transforms: Record<string, { hidden: string; visible: string }> = {
      "fade-up": { hidden: "translateY(30px)", visible: "translateY(0)" },
      "fade-down": { hidden: "translateY(-30px)", visible: "translateY(0)" },
      "fade-left": { hidden: "translateX(-30px)", visible: "translateX(0)" },
      "fade-right": { hidden: "translateX(30px)", visible: "translateX(0)" },
      "zoom-in": { hidden: "scale(0.9)", visible: "scale(1)" },
    };

    const transform = transforms[animation] || transforms["fade-up"];

    return {
      ...( isVisible ? baseVisible : baseHidden ),
      transform: isVisible ? transform.visible : transform.hidden,
      transitionProperty: "opacity, transform",
      transitionDuration: "600ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      transitionDelay: `${index * staggerDelay}ms`,
    };
  };

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div key={index} style={getAnimationStyle(index)}>
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
