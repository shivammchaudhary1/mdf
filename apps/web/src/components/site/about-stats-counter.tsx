"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

function AnimatedValue({ stat, active }: { stat: Stat; active: boolean }) {
  const [value, setValue] = useState(active ? 0 : stat.value);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const startedAt = performance.now();
    const duration = 1150;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(stat.value * eased));

      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, stat.value]);

  return (
    <>
      {value}
      {stat.suffix}
    </>
  );
}

export function AboutStatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-y-7 border-y border-black/7 py-7 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-black/8"
      aria-label="M. Dadu Films statistics"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="px-3 text-center sm:px-5">
          <p className="font-display text-3xl font-semibold tracking-[-.025em] text-[#171717] sm:text-4xl">
            <AnimatedValue stat={stat} active={active} />
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[.1em] text-[#858585]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
