'use client';

import { useEffect, useState, useRef } from 'react';

export function CommunityStats() {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = 50;
          const duration = 1000;
          const stepTime = Math.abs(Math.floor(duration / end));

          const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) {
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div
      ref={cardRef}
      className="relative h-full crystalline-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden select-none group"
    >
      {/* CSS-Only Crystalline Glint Ray on Hover */}
      <div className="crystalline-glint" />

      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

      {/* Top Header */}
      <div className="relative z-10">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
          Statistics
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            {count}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-heading">
            +
          </span>
        </div>
        <p className="text-xs font-mono text-slate-300 mt-1">
          Team Members
        </p>

        {/* Member Avatar Circle Stack */}
        <div className="flex items-center -space-x-1.5 mt-3">
          {['S', 'V', 'N', 'M', '+'].map((initial, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border border-[#0E0B18] flex items-center justify-center text-[9px] font-mono font-bold ${
                i === 4
                  ? 'bg-purple-900/90 text-purple-200 border-purple-400/40'
                  : 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white'
              }`}
            >
              {initial}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sub-label */}
      <div className="relative z-10 pt-4 border-t border-white/[0.06]">
        <p className="text-[11px] font-mono text-slate-400">
          Statistics
        </p>
        <p className="text-xs font-mono text-purple-300/80">
          Mentations &amp; Leads
        </p>
      </div>
    </div>
  );
}
