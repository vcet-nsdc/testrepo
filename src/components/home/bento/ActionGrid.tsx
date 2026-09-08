'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

const ACTION_CELLS = [
  {
    id: 'bento-box',
    title: 'Bento Box',
    href: '#bento-grid',
  },
  {
    id: 'grads-meetings',
    title: 'Grads & Meetings',
    href: '/team',
  },
  {
    id: 'resources',
    title: 'Interactive Resources',
    href: '/events',
  },
  {
    id: 'events',
    title: 'Events',
    href: '/events',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    href: '/contact',
  },
  {
    id: 'more',
    title: '+',
    isIcon: true,
    href: '/events',
  },
];

export function ActionGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full">
      {ACTION_CELLS.map((cell) => {
        return (
          <Link
            key={cell.id}
            href={cell.href}
            className="group relative rounded-2xl crystalline-card p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[105px] sm:min-h-[120px] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
          >
            {/* CSS-Only Crystalline Glint Ray on Hover */}
            <div className="crystalline-glint" />

            {/* Ambient hover glow */}
            <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 rounded-2xl transition-all duration-300 pointer-events-none" />

            {cell.isIcon ? (
              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] group-hover:border-purple-400/40 flex items-center justify-center text-slate-300 group-hover:text-purple-300 transition-colors">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-medium font-mono text-slate-200 group-hover:text-white transition-colors">
                {cell.title}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
