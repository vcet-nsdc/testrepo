'use client';

import { Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function WelcomeHub() {
  return (
    <div className="relative h-full crystalline-card rounded-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden group">
      {/* CSS-Only Crystalline Glint Ray on Hover */}
      <div className="crystalline-glint" />

      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />
      <div className="absolute inset-0 cyber-dots opacity-10 pointer-events-none" />

      {/* Top Tag */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>CHAPTER ECOSYSTEM · VCET #41</span>
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
          EST. 2024
        </span>
      </div>

      {/* Main Impactful Headline (Matching Image 1) */}
      <div className="relative z-10 mb-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-4">
          The Data Compiler:{' '}
          <span className="block mt-1 bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent font-extrabold text-neon-glow">
            AI &amp; Data Science&apos;s Student Corps.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-xl font-normal">
          Empowering student engineers at <strong className="text-white font-semibold">VCET Vasai</strong> to lead breakthroughs in Artificial Intelligence, Machine Learning, and Distributed Data Systems through research and hands-on mastery.
        </p>
      </div>

      {/* Action Links & Motto */}
      <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-mono font-medium transition-all"
        >
          <span>Explore Hackathons</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 text-xs font-mono transition-all"
        >
          <span>Classified Dossier</span>
        </Link>
        <div className="ml-auto hidden md:flex items-center gap-1.5 text-xs font-mono text-purple-300/70">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>VCET Autonomous Node</span>
        </div>
      </div>
    </div>
  );
}
