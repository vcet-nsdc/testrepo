'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface HeroGeodeProps {
  onTransitionToBento: () => void;
  startAnimation?: boolean;
}

export function HeroGeode({ onTransitionToBento, startAnimation = true }: HeroGeodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rockLeftRef = useRef<SVGGElement>(null);
  const rockRightRef = useRef<SVGGElement>(null);
  const cracksContainerRef = useRef<SVGGElement>(null);
  const scannerBeamRef = useRef<SVGGElement>(null);
  const coreLogoRef = useRef<HTMLDivElement>(null);
  const coreAuraRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLDivElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (!startAnimation) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Initial States
      gsap.set(rockLeftRef.current, {
        scale: 1,
        x: 0,
        opacity: 1,
        transformOrigin: 'left center',
      });
      gsap.set(rockRightRef.current, {
        scale: 1,
        x: 0,
        opacity: 1,
        transformOrigin: 'right center',
      });

      // Scanner Clip initial state: 0 height at the top
      gsap.set(clipRectRef.current, {
        attr: { y: 0, height: 0 },
      });
      gsap.set(scannerBeamRef.current, {
        y: 30,
        opacity: 0,
      });

      // Core Logo initial state
      gsap.set(coreLogoRef.current, {
        opacity: 0,
        scale: 0.88,
        filter: 'brightness(2) blur(6px)',
      });
      gsap.set(coreAuraRef.current, {
        opacity: 0,
        scale: 0.6,
      });
      gsap.set(titleTextRef.current, {
        opacity: 0,
        x: 20,
      });

      // =======================================================================
      // STEP 1: Laser Scanner Ignition & Top-to-Bottom Light Carve (0.0s - 1.5s)
      // =======================================================================
      tl.to(scannerBeamRef.current, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });

      // Animate clip rect and scanner beam downward concurrently over 1.5s
      const clipObj = { h: 0, y: 30 };
      tl.to(
        clipObj,
        {
          h: 360,
          y: 380,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (clipRectRef.current) {
              clipRectRef.current.setAttribute('height', clipObj.h.toString());
            }
            if (scannerBeamRef.current) {
              gsap.set(scannerBeamRef.current, { y: clipObj.y });
            }
          },
        },
        0.1
      );

      // Fade out scanner beam at the very bottom
      tl.to(
        scannerBeamRef.current,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.out',
        },
        1.5
      );

      // =======================================================================
      // STEP 2: The Core Eruption (1.5s - 2.0s) - Rock dissolves outward
      // =======================================================================
      tl.to(
        rockLeftRef.current,
        {
          x: -18,
          scale: 1.05,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        1.5
      );

      tl.to(
        rockRightRef.current,
        {
          x: 18,
          scale: 1.05,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        1.5
      );

      tl.to(
        cracksContainerRef.current,
        {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        1.55
      );

      // Core Logo Ignition
      tl.to(
        coreAuraRef.current,
        {
          opacity: 1,
          scale: 1.25,
          duration: 0.8,
          ease: 'expo.out',
        },
        1.55
      );

      tl.to(
        coreLogoRef.current,
        {
          opacity: 1,
          scale: 1,
          filter: 'brightness(1) blur(0px)',
          duration: 0.7,
          ease: 'expo.out',
        },
        1.6
      );

      // =======================================================================
      // STEP 3: Asymmetrical Typographic Sequence (Logo first, text +0.2s)
      // =======================================================================
      tl.to(
        titleTextRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
        1.8 // Exactly 0.2s after logo establishes
      );

      // =======================================================================
      // STEP 4: UI Lock & Bento Stagger Trigger (2.2s)
      // =======================================================================
      tl.call(
        () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nsdc-hero-locked'));
          }
        },
        undefined,
        2.0
      );

      tl.call(
        () => {
          onTransitionToBento();
        },
        undefined,
        2.2
      );
    }, containerRef);

    return () => ctx.revert();
  }, [startAnimation, onTransitionToBento]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#08060D] select-none"
    >
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none z-[1]" />

      {/* Subtle Background Cyber Grid */}
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
        <p className="text-white/20">LIGHT_CARVE: SYNTHESIZED</p>
      </div>

      <div className="absolute bottom-6 right-6 sm:right-10 z-30 font-mono text-[10px] text-right text-purple-300/30 tracking-widest pointer-events-none space-y-1">
        <p>SCANNER: RESONANCE_LOCKED</p>
        <p className="text-white/20">CONN: TLS_SECURE_DIRECT</p>
      </div>

      {/* Perspective Floor Grid */}
      <div className="absolute bottom-0 left-0 right-0 h-[26vh] perspective-floor-grid pointer-events-none z-[2]" />

      {/* =======================================================================
          MAIN HERO COMPOSITION: Crystalline Core + Asymmetrical Typographic Block
         ======================================================================= */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 px-6 max-w-5xl">
        {/* The Central Amethyst Geode & Scanner SVG */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center shrink-0">
          {/* Core Amethyst Radiant Aura */}
          <div
            ref={coreAuraRef}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-900/45 via-purple-600/35 to-indigo-500/25 blur-[65px] pointer-events-none z-0"
          />

          {/* Crystalline Core: Centered NSDC Emblem */}
          <div
            ref={coreLogoRef}
            className="absolute inset-0 m-auto w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 z-10 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-full h-full filter drop-shadow-[0_0_35px_rgba(164,114,247,0.95)] drop-shadow-[0_0_75px_rgba(127,69,219,0.75)]">
              <Image
                src="/assests/white NSDC logo.png"
                alt="VCET NSDC Core Logo"
                fill
                sizes="(max-width: 768px) 160px, 240px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* The Pure Black Rock Silhouette + SVG Scanner Mask Layer */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full z-20 pointer-events-none filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Dynamic Downward Clip-Path Mask */}
              <clipPath id="scanner-downward-clip">
                <rect ref={clipRectRef} x="0" y="30" width="400" height="0" />
              </clipPath>

              {/* Fissure Laser Gradient */}
              <linearGradient id="crack-neon-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E9D5FF" />
                <stop offset="70%" stopColor="#A472F7" />
                <stop offset="100%" stopColor="#7F45DB" />
              </linearGradient>

              {/* Laser Scanner Leading Beam Gradient */}
              <linearGradient id="laser-beam-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="#7F45DB" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#A472F7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* ==================== BASE BLACK ROCK SILHOUETTE ==================== */}
            <g id="rock-left" ref={rockLeftRef}>
              <path
                d="M198 35 L120 70 L45 155 L40 260 L110 345 L198 370 Z"
                fill="#050308"
                stroke="#1E0E2E"
                strokeWidth="1.5"
              />
              {/* Left Subtle Chiseled Facets */}
              <path d="M120 70 L198 120 L198 35 Z" fill="#09050F" opacity="0.6" />
              <path d="M45 155 L130 180 L110 345 L40 260 Z" fill="#020105" opacity="0.8" />
            </g>

            <g id="rock-right" ref={rockRightRef}>
              <path
                d="M202 35 L280 70 L355 155 L360 260 L290 345 L202 370 Z"
                fill="#050308"
                stroke="#1E0E2E"
                strokeWidth="1.5"
              />
              {/* Right Subtle Chiseled Facets */}
              <path d="M280 70 L202 120 L202 35 Z" fill="#09050F" opacity="0.6" />
              <path d="M355 155 L270 180 L290 345 L360 260 Z" fill="#020105" opacity="0.8" />
            </g>

            {/* ==================== THE GLOWING CRACKS (Clipped by Scanner) ==================== */}
            <g
              id="glowing-cracks-group"
              ref={cracksContainerRef}
              clipPath="url(#scanner-downward-clip)"
              className="filter drop-shadow-[0_0_12px_#A472F7] drop-shadow-[0_0_24px_#7F45DB]"
            >
              {/* Central Primary Fissure */}
              <path
                d="M200 35 L196 90 L208 140 L192 195 L208 245 L194 300 L200 370"
                stroke="url(#crack-neon-glow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Left Branching Fissure Network */}
              <path
                d="M196 90 L150 110 L120 70 M196 90 L160 145 L105 150 M208 140 L140 180 L80 160 M192 195 L130 230 L70 250 M208 245 L150 290 L110 345 M194 300 L140 335"
                stroke="#A472F7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />

              {/* Right Branching Fissure Network */}
              <path
                d="M200 35 L245 65 L280 70 M208 140 L265 130 L320 150 M192 195 L270 205 L355 155 M208 245 L275 250 L340 270 M194 300 L260 320 L290 345 M194 300 L235 345"
                stroke="#A472F7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />

              {/* Micro Core Spallation Sparks */}
              <circle cx="160" cy="145" r="3" fill="#FFFFFF" />
              <circle cx="265" cy="130" r="3" fill="#FFFFFF" />
              <circle cx="140" cy="180" r="2.5" fill="#E9D5FF" />
              <circle cx="270" cy="205" r="2.5" fill="#E9D5FF" />
              <circle cx="150" cy="290" r="2.5" fill="#FFFFFF" />
            </g>

            {/* ==================== THE LASER SCANNER BEAM LINE ==================== */}
            <g id="scanner-beam-line" ref={scannerBeamRef}>
              <line
                x1="20"
                y1="0"
                x2="380"
                y2="0"
                stroke="url(#laser-beam-grad)"
                strokeWidth="3.5"
                className="filter drop-shadow-[0_0_12px_#FFFFFF] drop-shadow-[0_0_25px_#A472F7]"
              />
              <ellipse
                cx="200"
                cy="0"
                rx="60"
                ry="4"
                fill="#FFFFFF"
                className="filter drop-shadow-[0_0_15px_#A472F7]"
              />
            </g>
          </svg>
        </div>

        {/* =======================================================================
            ASYMMETRICAL TYPOGRAPHY: Fades in 0.2s after logo establishes
           ======================================================================= */}
        <div
          ref={titleTextRef}
          className="flex flex-col text-center md:text-left max-w-md pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono w-fit mx-auto md:mx-0 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VCET CHAPTER #41 · SYNTHESIZED</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
            VCET NSDC
          </h2>

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
