'use client';

import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const TELEMETRY_STREAM = [
  '[ Chapter Rank: Global #12 ]',
  '[ Models Deployed: 42 ]',
  '[ Models Deployed: 170 ]',
  '[ Active Projects: 110 ]',
  '[ Active Resources: 46 ]',
  '[ Models Projects: 235 ]',
  '[ Chapter Rank: 41 ]',
];

export function DataTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (currentLineIdx >= TELEMETRY_STREAM.length) {
      return;
    }

    const currentLine = TELEMETRY_STREAM[currentLineIdx];
    if (!currentLine) return;

    if (charIdx < currentLine.length) {
      const timer = setTimeout(() => {
        setCharIdx((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      const delay = setTimeout(() => {
        setLines((prev) => [...prev, currentLine]);
        setCurrentLineIdx((prev) => prev + 1);
        setCharIdx(0);
      }, 160);
      return () => clearTimeout(delay);
    }
  }, [currentLineIdx, charIdx]);

  return (
    <div className="relative h-full crystalline-card rounded-2xl p-6 flex flex-col justify-between overflow-hidden font-mono select-none group">
      {/* CSS-Only Crystalline Glint Ray on Hover */}
      <div className="crystalline-glint" />

      {/* Subtle Terminal Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />

      {/* Terminal Title Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-xs text-slate-400 ml-2 font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              nsdc-compiler ~ telemetry
            </span>
          </div>

          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            LIVE_FEED
          </span>
        </div>

        {/* Telemetry Output Lines */}
        <div className="space-y-1.5 text-xs text-emerald-400/90 leading-relaxed font-mono">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-slate-500 select-none">&gt;</span>
              <span className="text-emerald-400 font-medium">{line}</span>
            </div>
          ))}

          {/* Typing Line */}
          {currentLineIdx < TELEMETRY_STREAM.length && (
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="text-slate-500 select-none">&gt;</span>
              <span>{TELEMETRY_STREAM[currentLineIdx]?.slice(0, charIdx)}</span>
              <span className="w-2 h-3.5 bg-emerald-400 animate-cursor-blink inline-block" />
            </div>
          )}
        </div>
      </div>

      {/* Glowing Neon Green Motto Pill */}
      <div className="mt-6 flex justify-end">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-400/50 text-emerald-300 text-xs font-mono shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">&ldquo;Data beats emotions.&rdquo;</span>
        </div>
      </div>
    </div>
  );
}
