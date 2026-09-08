'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { WelcomeHub } from './bento/WelcomeHub';
import { DataTerminal } from './bento/DataTerminal';
import { ActionGrid } from './bento/ActionGrid';
import { CommunityStats } from './bento/CommunityStats';
import { EventSpotlight } from './bento/EventSpotlight';
import { EventTimeline } from './bento/EventTimeline';
import { Github, Disc as Discord, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { getHasPlayedIntro } from '@/lib/introState';

export function BentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(() => getHasPlayedIntro());

  useEffect(() => {
    const handleReveal = () => {
      setIsRevealed(true);
    };

    window.addEventListener('nsdc-reveal-bento', handleReveal);

    // Fallback: Intersection observer if scrolled manually
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsRevealed(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('nsdc-reveal-bento', handleReveal);
      observer.disconnect();
    };
  }, []);

  // High-Speed GSAP/Framer Stagger (0.4s sequential data compilation)
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 32, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        delay: i * 0.07,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section
      id="bento-grid"
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#08060D]"
    >
      {/* Background Cyber Glow & Matrix Grid */}
      <div className="absolute inset-0 bento-matrix-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1000px] h-[500px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Bento Layout (Image 1 Structure) */}
      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* =====================================================================
            TOP ROW: Main Title (Left) + macOS Data Terminal (Right)
           ===================================================================== */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          {/* Top-Left: The Data Compiler Title & Identity */}
          <motion.div
            custom={0}
            initial="hidden"
            animate={isRevealed ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="col-span-12 lg:col-span-6 xl:col-span-7 flex"
          >
            <WelcomeHub />
          </motion.div>

          {/* Top-Right: macOS Live Telemetry Terminal */}
          <motion.div
            custom={1}
            initial="hidden"
            animate={isRevealed ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="col-span-12 lg:col-span-6 xl:col-span-5 flex"
          >
            <DataTerminal />
          </motion.div>
        </div>

        {/* =====================================================================
            BOTTOM ROW: Action Grid + Statistics + Events Spotlight + Upcoming
           ===================================================================== */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          {/* Action Grid (6-cell micro matrix) */}
          <motion.div
            custom={2}
            initial="hidden"
            animate={isRevealed ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="col-span-12 md:col-span-6 lg:col-span-4 flex"
          >
            <ActionGrid />
          </motion.div>

          {/* Statistics (50+ Team Members) */}
          <motion.div
            custom={3}
            initial="hidden"
            animate={isRevealed ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 flex"
          >
            <CommunityStats />
          </motion.div>

          {/* Events Spotlight (Stacked highlight cards with green hover) */}
          <motion.div
            custom={4}
            initial="hidden"
            animate={isRevealed ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 flex"
          >
            <EventSpotlight />
          </motion.div>

          {/* Upcoming Events List */}
          <motion.div
            custom={5}
            initial="hidden"
            animate={isRevealed ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="col-span-12 md:col-span-12 lg:col-span-3 flex"
          >
            <EventTimeline />
          </motion.div>
        </div>

        {/* =====================================================================
            BOTTOM MONOLITHIC RIBBON (Image 1 Bottom Status Bar)
           ===================================================================== */}
        <motion.div
          custom={6}
          initial="hidden"
          animate={isRevealed ? 'visible' : 'hidden'}
          variants={cardVariants}
          className="mt-4 p-4 rounded-xl bento-cell flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400 select-none"
        >
          <p className="text-center sm:text-left">
            Minimalist monolithic footer index list, public GitHub activity feeds. Non-destructive changes and Project links.
          </p>

          <div className="flex items-center gap-3 shrink-0 text-slate-400">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="hover:text-purple-300 transition-colors"
              aria-label="Discord Server"
            >
              <Discord className="w-4 h-4" />
            </Link>
            <Link
              href="/events"
              className="hover:text-purple-300 transition-colors"
              aria-label="Ecosystem Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
