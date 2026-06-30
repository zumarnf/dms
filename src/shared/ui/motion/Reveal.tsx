"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";

type RevealProps = React.ComponentProps<"div"> & {
  /** Stagger delay in ms applied once the element scrolls into view. */
  delay?: number;
};

/**
 * Scroll-reveal wrapper: fades + slides children in once they enter the
 * viewport. Falls back to immediately visible when IntersectionObserver is
 * unavailable, and `prefers-reduced-motion` disables the motion via globals.css.
 */
export function Reveal({ delay = 0, className, style, children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
