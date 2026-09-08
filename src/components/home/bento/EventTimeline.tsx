'use client';

import Link from 'next/link';

interface TimelineEvent {
  id: string;
  title: string;
  badge: string;
  href: string;
}

const UPCOMING_EVENTS: TimelineEvent[] = [
  {
    id: 'ai-efficient',
    title: 'Artificial Efficient Learning',
    badge: 'Mar 2024',
    href: '/events',
  },
  {
    id: 'vcet-intelligence',
    title: 'VCET Intelligence Learning',
    badge: 'May 2025',
    href: '/events',
  },
  {
    id: 'vcet-workshop',
    title: 'VCET Workshop',
    badge: '28-08-2026',
    href: '/events',
  },
];

export function EventTimeline() {
  return (
    <div className="relative h-full crystalline-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden group">
      {/* CSS-Only Crystalline Glint Ray on Hover */}
      <div className="crystalline-glint" />

      {/* Top Header */}
      <div className="relative z-10">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-white/[0.06]">
          Upcoming Events
        </h3>

        {/* Event List Items */}
        <div className="space-y-3">
          {UPCOMING_EVENTS.map((event) => (
            <Link
              key={event.id}
              href={event.href}
              className="group/item flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-xs font-mono text-slate-200 group-hover/item:text-purple-300 transition-colors leading-snug line-clamp-1">
                {event.title}
              </span>
              <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] group-hover/item:border-purple-500/30 group-hover/item:text-purple-200 transition-colors">
                {event.badge}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="relative z-10 pt-4 border-t border-white/[0.06] mt-4 flex justify-between items-center text-[11px] font-mono text-slate-400">
        <span>Calendar Feed</span>
        <Link href="/events" className="text-purple-300 hover:text-white transition-colors">
          View All &rarr;
        </Link>
      </div>
    </div>
  );
}
