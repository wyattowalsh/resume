import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

export type SectionProgressItem = {
  id: string;
  label: string;
  kicker: string;
};

type SectionProgressNavProps = {
  items: SectionProgressItem[];
};

export function SectionProgressNav({ items }: SectionProgressNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );

  useEffect(() => {
    if (items.length === 0 || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const visibleSections = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        }

        const nextActiveId = [...visibleSections.entries()].sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0];

        if (nextActiveId) {
          setActiveId(nextActiveId);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      },
    );

    for (const item of items) {
      const section = document.getElementById(item.id);
      if (section) {
        observer.observe(section);
      }
    }

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const sentinel = document.querySelector("[data-scroll-progress-sentinel]");

    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  if (items.length === 0) {
    return null;
  }

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  const progressValue = Math.round(((activeIndex + 1) / items.length) * 100);

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "section-progress-nav print:hidden",
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0",
      )}
    >
      <Progress
        value={progressValue}
        aria-label="Resume scroll progress"
        aria-valuetext={`${items[activeIndex]?.label ?? "Resume"} section`}
        className="h-px rounded-none bg-transparent"
      />
    </div>
  );
}
