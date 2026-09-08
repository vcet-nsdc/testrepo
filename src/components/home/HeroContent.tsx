'use client';

import Link from 'next/link';
import { ArrowDown, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';

interface HeroContentProps {
  onExploreClick: () => void;
}

export function HeroContent({ onExploreClick }: HeroContentProps) {
  return (
    <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto px-6 pt-4 pb-12 select-none">
      {/* Top Telemetry Chip */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-6 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="tracking-wider">SYSTEM ACTIVE · VCET CHAPTER #41</span>
        <span className="text-white/20">|</span>
        <span className="text-purple-200/70">2025-2026 CYCLE</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
        The Data Compiler:{' '}
        <span className="block mt-2 bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 bg-clip-text text-transparent text-neon-glow font-extrabold">
          AI & Data Science&apos;s Student Corps
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
        Empowering student engineers at <strong className="text-white font-semibold">VCET Vasai</strong> to lead breakthroughs in Artificial Intelligence, Machine Learning, and Data Visualization through high-impact hackathons, workshops, and research initiatives.
      </p>

      {/* Iconic Motto Quote */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-purple-300/90 text-sm font-mono italic mb-10 backdrop-blur-sm shadow-inner">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span>&ldquo;Data beats emotions.&rdquo;</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
        <button
          onClick={onExploreClick}
          className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-300 shadow-[0_0_30px_rgba(127,69,219,0.4)] hover:shadow-[0_0_45px_rgba(164,114,247,0.6)] cursor-pointer"
        >
          <span>Explore Ecosystem</span>
          <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </button>

        <Link
          href="/events"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-purple-500/40 text-slate-200 hover:text-white font-medium text-sm transition-all duration-300 backdrop-blur-md"
        >
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Marquee Events</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
        </Link>
      </div>
    </div>
  );
}
