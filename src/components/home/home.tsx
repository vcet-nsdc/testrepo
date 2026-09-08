'use client';

import { CosmicNodeIgnition } from './CosmicNodeIgnition';
import { BentoGrid } from './BentoGrid';

export default function HomePage() {
  const handleSequenceComplete = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nsdc-reveal-bento'));
    }
  };

  return (
    <main className="min-h-screen bg-[#05030A] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden relative">
      {/* Global Fixed Subtle Purple Grid (Anchored permanently behind content below hero) */}
      <div className="global-fixed-grid" />

      {/* 1. The Cosmic Node Ignition Hero (Three.js 3D Emblem + Star Ignition + Gyro Orbits + Pill Navbar Ascent) */}
      <CosmicNodeIgnition onSequenceComplete={handleSequenceComplete} />

      {/* 2. Crystalline Bento Grid (Data Compiler Matrix with Glint Effects) */}
      <BentoGrid />
    </main>
  );
}
