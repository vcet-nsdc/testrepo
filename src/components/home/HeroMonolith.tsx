'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface HeroMonolithProps {
  onTransitionToBento: () => void;
  startAnimation?: boolean;
}

export function HeroMonolith({ onTransitionToBento, startAnimation = true }: HeroMonolithProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalDoorRef = useRef<HTMLDivElement>(null);
  const portalCoreRef = useRef<HTMLDivElement>(null);
  const groundReflectionRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const anamorphicFlareRef = useRef<HTMLDivElement>(null);
  const horizontalStreakRef = useRef<HTMLDivElement>(null);
  const dustParticlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAnimation) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const tl = gsap.timeline();

      // Initial States
      gsap.set(portalDoorRef.current, {
        opacity: 0,
        scaleY: 0.6,
        filter: 'blur(15px) brightness(0.5)',
      });
      gsap.set(portalCoreRef.current, {
        opacity: 0,
        scale: 0.8,
      });
      gsap.set(groundReflectionRef.current, {
        opacity: 0,
        scaleX: 0.5,
      });
      gsap.set(logoWrapperRef.current, {
        opacity: 0,
        scale: 0.15,
        z: -120,
        filter: 'brightness(3) blur(6px)',
      });
      gsap.set([anamorphicFlareRef.current, horizontalStreakRef.current], {
        opacity: 0,
        scaleX: 0,
        scaleY: 0.2,
      });

      // 1. Monolith Door Powers On & Vertically Expands
      tl.to(portalDoorRef.current, {
        opacity: 1,
        scaleY: 1,
        filter: 'blur(0px) brightness(1.2)',
        duration: 1.0,
        ease: 'power3.out',
      });

      tl.to(
        [portalCoreRef.current, groundReflectionRef.current],
        {
          opacity: 1,
          scale: 1,
          scaleX: 1,
          duration: 0.9,
          ease: 'power2.out',
        },
        '-=0.6'
      );

      // 2. Animate Data Dust Particles drifting upward in the light beam
      if (dustParticlesRef.current) {
        const particles = dustParticlesRef.current.children;
        Array.from(particles).forEach((particle, i) => {
          gsap.fromTo(
            particle,
            {
              y: 80 + Math.random() * 120,
              x: (Math.random() - 0.5) * 60,
              opacity: 0,
              scale: 0.3 + Math.random() * 0.7,
            },
            {
              y: -220 - Math.random() * 100,
              x: (Math.random() - 0.5) * 80,
              opacity: 0.8,
              duration: 2.8 + Math.random() * 2.2,
              repeat: -1,
              delay: (i * 0.12) % 2,
              ease: 'power1.out',
            }
          );
        });
      }

      // 3. NSDC Logo Extrudes Forward Centered & Locks in Hero
      tl.to(
        logoWrapperRef.current,
        {
          opacity: 1,
          scale: isMobile ? 1.0 : 1.2,
          z: 0,
          filter: 'brightness(1) blur(0px)',
          duration: 1.2,
          ease: 'expo.out',
        },
        '-=0.3'
      );

      // 4. Exact Lock-In Moment: Dispatch Event for Independent Navbar Fade-In
      tl.call(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nsdc-hero-locked'));
        }
      });

      // 5. Cinematic Pause to establish the majestic composition
      tl.to({}, { duration: 1.0 });

      // 6. Anamorphic Exposure Bloom (Horizontal Flare Expansion - Corners stay in Dark Void)
      tl.to(
        [anamorphicFlareRef.current, horizontalStreakRef.current],
        {
          opacity: 0.95,
          scaleX: isMobile ? 1.2 : 1.8,
          scaleY: isMobile ? 0.35 : 0.45,
          duration: 0.45,
          ease: 'power3.in',
        }
      );

      // Logo Anchor Continuity: Logo remains clearly anchored and gently settles
      tl.to(
        logoWrapperRef.current,
        {
          scale: isMobile ? 0.9 : 1.0,
          filter: 'drop-shadow(0 0 35px rgba(255,255,255,1)) drop-shadow(0 0 70px rgba(164,114,247,0.9))',
          duration: 0.45,
          ease: 'power2.out',
        },
        '-=0.45'
      );

      // 7. Peak Exposure Moment: Trigger Staggered Bento Glide Entrance
      tl.call(() => {
        onTransitionToBento();
      });

      // 8. Anamorphic Flare Softens and Recedes into the Ambient Grid
      tl.to(
        [anamorphicFlareRef.current, horizontalStreakRef.current],
        {
          opacity: 0,
          scaleX: 0.3,
          scaleY: 0.1,
          duration: 0.6,
          ease: 'power3.out',
        },
        '+=0.15'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [startAnimation, onTransitionToBento]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#08060D] select-none"
      style={{ perspective: '1200px' }}
    >
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none z-[1]" />

      {/* Subtle Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none z-[1]" />

      {/* Atmospheric Void Sky Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1100px] h-[550px] bg-gradient-to-b from-indigo-950/25 via-purple-900/15 to-transparent rounded-full blur-[140px] pointer-events-none z-[1]" />

      {/* =========================================================================
          PERSISTENT PERIPHERAL TELEMETRY (Z-Index 30 - Stays through the transition)
         ========================================================================= */}
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
        <p className="text-white/20">DATA_CORE: COMPILER_V2</p>
      </div>

      <div className="absolute bottom-6 right-6 sm:right-10 z-30 font-mono text-[10px] text-right text-purple-300/30 tracking-widest pointer-events-none space-y-1">
        <p>SECURITY_LEVEL: ALPHA</p>
        <p className="text-white/20">CONN: TLS_SECURE_DIRECT</p>
      </div>

      {/* =========================================================================
          GROUNDING THE VOID: PERSPECTIVE FLOOR GRID (Bottom 25% with fade mask)
         ========================================================================= */}
      <div className="absolute bottom-0 left-0 right-0 h-[28vh] perspective-floor-grid pointer-events-none z-[2]" />

      {/* =========================================================================
          THE CINEMATIC MONOLITH PORTAL DOOR
         ========================================================================= */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto pt-6">
        {/* Monolith Door Structure */}
        <div
          ref={portalDoorRef}
          className="relative w-20 sm:w-28 md:w-32 h-[340px] sm:h-[420px] md:h-[460px] flex items-center justify-center origin-bottom transition-all duration-500"
        >
          {/* Outer Radiant Aura */}
          <div className="absolute inset-0 bg-white/30 rounded-t-sm blur-[35px] animate-monolith-glow pointer-events-none" />
          <div className="absolute -inset-4 bg-purple-500/25 rounded-t-sm blur-[60px] pointer-events-none" />

          {/* Door Frame & Luminous Inner Core */}
          <div
            ref={portalCoreRef}
            className="relative w-full h-full rounded-t-[2px] bg-gradient-to-t from-slate-100 via-white to-purple-100 monolith-door-frame overflow-hidden flex flex-col items-center justify-center"
          >
            {/* Inner Radiant Door Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/80 to-slate-200 opacity-95" />
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-t from-purple-200/40 via-transparent to-white/60 animate-pulse pointer-events-none" />
            
            {/* Threshold Line */}
            <div className="w-[1px] h-full bg-white/60 shadow-[0_0_12px_#ffffff]" />
          </div>

          {/* Atmospheric Data Dust (Particles Drifting Upward Inside the Light) */}
          <div
            ref={dustParticlesRef}
            className="absolute inset-0 overflow-hidden pointer-events-none z-20"
          >
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 bottom-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#A472F7]"
              />
            ))}
          </div>

          {/* Door Base Horizon Light Spill */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-3 bg-white blur-[4px] rounded-full shadow-[0_0_25px_#ffffff]" />
        </div>

        {/* Perspective Ground Reflection */}
        <div
          ref={groundReflectionRef}
          className="w-[280px] sm:w-[420px] md:w-[500px] h-[130px] sm:h-[180px] monolith-ground-reflection pointer-events-none -mt-4 z-[3]"
        />

        {/* =========================================================================
            PROMINENT CENTERED EXTRUDED NSDC LOGO (Permanent Anchor)
           ========================================================================= */}
        <div
          ref={logoWrapperRef}
          className="absolute z-40 pointer-events-none w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60"
        >
          <div className="relative w-full h-full filter drop-shadow-[0_0_40px_rgba(255,255,255,0.95)] drop-shadow-[0_0_80px_rgba(164,114,247,0.8)]">
            <Image
              src="/assests/white NSDC logo.png"
              alt="NSDC VCET Logo"
              fill
              sizes="(max-width: 768px) 160px, 240px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ANAMORPHIC EXPOSURE BLOOM & HORIZONTAL STREAK (Corners Stay In Void)
         ========================================================================= */}
      <div
        ref={anamorphicFlareRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[340px] sm:h-[440px] anamorphic-bloom-flare pointer-events-none z-20"
      />

      <div
        ref={horizontalStreakRef}
        className="absolute top-1/2 left-0 right-0 h-[2px] sm:h-[3px] -translate-y-1/2 anamorphic-horizontal-streak pointer-events-none z-25"
      />
    </section>
  );
}
