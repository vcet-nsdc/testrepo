'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function EventSpotlight() {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Active Highlighted Event Card */}
      <Link
        href="/events"
        className="group relative flex-1 crystalline-card-highlight rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden"
      >
        {/* CSS Glint Ray */}
        <div className="crystalline-glint" />

        <div className="relative z-10 flex items-start justify-between">
          <span className="text-sm font-semibold font-mono text-white group-hover:text-emerald-300 transition-colors">
            Events
          </span>
          <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
        <p className="relative z-10 text-xs font-mono text-emerald-400/80 mt-4">
          Events &amp; Workshops
        </p>
      </Link>

      {/* Secondary Events Card */}
      <Link
        href="/events"
        className="group relative flex-1 crystalline-card rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden"
      >
        {/* CSS Glint Ray */}
        <div className="crystalline-glint" />

        <div className="relative z-10 flex items-start justify-between">
          <span className="text-sm font-semibold font-mono text-slate-200 group-hover:text-white transition-colors">
            Events
          </span>
          <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-purple-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
        <p className="relative z-10 text-xs font-mono text-slate-400 mt-4">
          Hackathons &amp; Labs
        </p>
      </Link>
    </div>
  );
}
