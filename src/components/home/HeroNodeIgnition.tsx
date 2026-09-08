'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroNodeIgnitionProps {
  onSequenceComplete: () => void;
  startAnimation?: boolean;
}

export function HeroNodeIgnition({ onSequenceComplete, startAnimation = true }: HeroNodeIgnitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesGroupRef = useRef<SVGGElement>(null);
  const axisLineRef = useRef<SVGLineElement>(null);
  const innerRingRef = useRef<SVGCircleElement>(null);
  const outerRingRef = useRef<SVGCircleElement>(null);
  const ellipse1Ref = useRef<SVGEllipseElement>(null);
  const ellipse2Ref = useRef<SVGEllipseElement>(null);
  const ambientAuraRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAnimation) return;

    // React useEffect with gsap.context() for bulletproof lifecycle safety & cleanup
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // =======================================================================
      // STEP 0: SVG Path Length Initialization
      // =======================================================================
      const strokeElements = [
        axisLineRef.current,
        innerRingRef.current,
        outerRingRef.current,
        ellipse1Ref.current,
        ellipse2Ref.current,
      ].filter(Boolean);

      strokeElements.forEach((el) => {
        if (el) {
          const length = (el as SVGGeometryElement).getTotalLength?.() || 800;
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 0,
          });
        }
      });

      // Prepare nodes (initially invisible in the dark void)
      if (nodesGroupRef.current) {
        gsap.set(nodesGroupRef.current.children, {
          scale: 0,
          transformOrigin: 'center center',
          opacity: 0,
        });
      }

      gsap.set(ambientAuraRef.current, {
        opacity: 0,
        scale: 0.5,
      });

      gsap.set(heroTextRef.current, {
        opacity: 0,
        y: 20,
      });

      // =======================================================================
      // STEP 1: The Pitch-Black Void (0.0s - 0.4s) - Silence in darkness
      // =======================================================================
      tl.to({}, { duration: 0.4 });

      // =======================================================================
      // STEP 2: The Ignition (0.5s) - Three Nodes flash out of the dark void
      // =======================================================================
      if (nodesGroupRef.current) {
        tl.to(
          nodesGroupRef.current.children,
          {
            scale: 1.25,
            opacity: 1,
            duration: 0.25,
            stagger: 0.08,
            ease: 'back.out(2)',
          },
          0.45
        ).to(
          nodesGroupRef.current.children,
          {
            scale: 1,
            duration: 0.2,
            ease: 'power2.inOut',
          },
          0.7
        );
      }

      // Brief ominous hang in the void (eyes in the dark effect)
      tl.to({}, { duration: 0.3 });

      // =======================================================================
      // STEP 3: The Data Trace (1.0s) - Energy shoots along diagonal axis line
      // =======================================================================
      tl.set(axisLineRef.current, { opacity: 1 }, 1.0);
      tl.to(
        axisLineRef.current,
        {
          strokeDashoffset: 0,
          duration: 0.45,
          ease: 'expo.out',
        },
        1.0
      );

      // Orbital Rings & Crossing Arcs Rapidly Draw & Spin Out
      tl.set(
        [innerRingRef.current, outerRingRef.current, ellipse1Ref.current, ellipse2Ref.current],
        { opacity: 1 },
        1.25
      );

      tl.to(
        [ellipse1Ref.current, ellipse2Ref.current],
        {
          strokeDashoffset: 0,
          duration: 0.65,
          ease: 'power2.out',
          stagger: 0.1,
        },
        1.25
      );

      tl.to(
        [innerRingRef.current, outerRingRef.current],
        {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
        },
        1.35
      );

      // =======================================================================
      // STEP 4: The Ambient Reveal (1.8s) - Soft radial glow & UI fade-in
      // =======================================================================
      tl.to(
        ambientAuraRef.current,
        {
          opacity: 1,
          scale: 1.2,
          duration: 0.9,
          ease: 'power2.out',
        },
        1.7
      );

      tl.to(
        heroTextRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
        1.85
      );

      // Lock Navbar & Trigger Bento Reveal
      tl.call(
        () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nsdc-hero-locked'));
          }
        },
        undefined,
        1.8
      );

      tl.call(
        () => {
          onSequenceComplete();
        },
        undefined,
        1.9
      );
    }, containerRef);

    return () => ctx.revert();
  }, [startAnimation, onSequenceComplete]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#08060D] select-none"
    >
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none z-[1]" />

      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none z-[1]" />

      {/* Persistent Peripheral Telemetry (4 Corners) */}
      <div className="absolute top-20 left-6 sm:left-10 z-30 font-mono text-[10px] text-purple-300/30 tracking-widest pointer-events-none space-y-1">
        <p>// SYS.NODE: VCET_PRIMARY_01</p>
        <p className="text-white/20">LAT: 19.3838° N · LON: 72.8282° E</p>
      </div>

      <div className="absolute top-20 right-6 sm:right-10 z-30 font-mono text-[10px] text-right text-purple-300/30 tracking-widest pointer-events-none space-y-1">
        <p>MATRIX_STATUS: SYNCHRONIZED</p>
        <p className="text-white/20">CYCLE: 2025-2026 // ACTIVE</p>
      </div>

      <div className="absolute bottom-6 left-6 sm:left-10 z-30 font-mono text-[10px] text-purple-300/30 tracking-widest pointer-events-none space-y-1">
        <p>BUFFER: OPTIMIZED [60FPS]</p>
        <p className="text-white/20">IGNITION: SYNTHESIZED</p>
      </div>

      <div className="absolute bottom-6 right-6 sm:right-10 z-30 font-mono text-[10px] text-right text-purple-300/30 tracking-widest pointer-events-none space-y-1">
        <p>RESONANCE: LOCKED</p>
        <p className="text-white/20">CONN: TLS_SECURE_DIRECT</p>
      </div>

      {/* Perspective Floor Grid */}
      <div className="absolute bottom-0 left-0 right-0 h-[26vh] perspective-floor-grid pointer-events-none z-[2]" />

      {/* =======================================================================
          MAIN HERO COMPOSITION: Node Ignition Emblem + Ambient Reveal Typography
         ======================================================================= */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 px-6 max-w-5xl">
        {/* The Animated Node Ignition SVG */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center shrink-0">
          {/* Ambient Radial Aura (Expands on complete) */}
          <div
            ref={ambientAuraRef}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-900/40 via-purple-600/30 to-indigo-500/20 blur-[70px] pointer-events-none z-0"
          />

          {/* Master Pure SVG Logo Anatomy */}
          <svg
            viewBox="0 0 300 300"
            className="relative z-10 w-full h-full filter drop-shadow-[0_0_25px_rgba(164,114,247,0.85)] drop-shadow-[0_0_60px_rgba(127,69,219,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ==================== 1. THE THREE IGNITION NODES ==================== */}
            <g id="nodes-group" ref={nodesGroupRef}>
              {/* Bottom-Left Node */}
              <circle
                cx="90"
                cy="270"
                r="7"
                fill="#A472F7"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_15px_#FFFFFF] drop-shadow-[0_0_30px_#A472F7]"
              />
              {/* Central Primary Node */}
              <circle
                cx="150"
                cy="150"
                r="11"
                fill="#9333EA"
                stroke="#F3E8FF"
                strokeWidth="3"
                className="filter drop-shadow-[0_0_20px_#FFFFFF] drop-shadow-[0_0_40px_#A472F7]"
              />
              {/* Top-Right Node */}
              <circle
                cx="210"
                cy="30"
                r="7"
                fill="#A472F7"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_15px_#FFFFFF] drop-shadow-[0_0_30px_#A472F7]"
              />
            </g>

            {/* ==================== 2. THE DIAGONAL AXIS LINE ==================== */}
            <line
              ref={axisLineRef}
              x1="90"
              y1="270"
              x2="210"
              y2="30"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_12px_#A472F7]"
            />

            {/* ==================== 3. THE ORBITAL RINGS & ARCS ==================== */}
            <g transform="rotate(-35 150 150)">
              <ellipse
                ref={ellipse1Ref}
                cx="150"
                cy="150"
                rx="105"
                ry="48"
                stroke="#C084FC"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            <g transform="rotate(35 150 150)">
              <ellipse
                ref={ellipse2Ref}
                cx="150"
                cy="150"
                rx="105"
                ry="48"
                stroke="#A855F7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Inner Ring */}
            <circle
              ref={innerRingRef}
              cx="150"
              cy="150"
              r="95"
              stroke="#7F45DB"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Outer Ring */}
            <circle
              ref={outerRingRef}
              cx="150"
              cy="150"
              r="125"
              stroke="#A472F7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="16 8"
            />
          </svg>
        </div>

        {/* =======================================================================
            AMBIENT REVEAL TYPOGRAPHY: Fades in gracefully with ambient light (1.8s)
           ======================================================================= */}
        <div
          ref={heroTextRef}
          className="flex flex-col text-center md:text-left max-w-md pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono w-fit mx-auto md:mx-0 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VCET CHAPTER #41 · NODE ACTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
            VCET NSDC
          </h1>

          <p className="text-xs sm:text-sm font-mono tracking-widest text-purple-300/80 uppercase mt-1">
            National Student Data Corps
          </p>

          <p className="text-xs font-mono text-slate-400/80 mt-3 leading-relaxed">
            Engineering the frontier of Artificial Intelligence &amp; Data Science through hands-on mastery.
          </p>
        </div>
      </div>
    </section>
  );
}
