"use client";

import { useIntersection } from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";

/**
 * Restrained scroll reveal: a short rise, once, and nothing else. No parallax,
 * no scale, no particles — the motion budget goes to line-drawing figures.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const { ref, visible } = useIntersection<HTMLElement>();
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
