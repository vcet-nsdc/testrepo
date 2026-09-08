'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface NSDCLoaderProps {
  onComplete: () => void;
}

export function NSDCLoader({ onComplete }: NSDCLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<SVGCircleElement>(null);
  const innerRingRef = useRef<SVGCircleElement>(null);
  const ellipse1Ref = useRef<SVGEllipseElement>(null);
  const ellipse2Ref = useRef<SVGEllipseElement>(null);
  const axisRef = useRef<SVGLineElement>(null);
  const nodeCenterRef = useRef<SVGCircleElement>(null);
  const nodeTopRef = useRef<SVGCircleElement>(null);
  const nodeBottomRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.05,
            duration: 0.4,
            ease: 'power3.inOut',
            onComplete,
          });
        },
      });

      // Prepare path stroke lengths
      const strokeElements = [
        outerRingRef.current,
        innerRingRef.current,
        ellipse1Ref.current,
        ellipse2Ref.current,
        axisRef.current,
      ].filter(Boolean);

      strokeElements.forEach((el) => {
        if (el) {
          const length = (el as SVGGeometryElement).getTotalLength?.() || 800;
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1,
          });
        }
      });

      // Prepare nodes
      gsap.set([nodeCenterRef.current, nodeTopRef.current, nodeBottomRef.current], {
        scale: 0,
        transformOrigin: 'center center',
        opacity: 0,
      });

      // Fast, purposeful vector trace (~30% faster)
      tl.to(
        outerRingRef.current,
        {
          strokeDashoffset: 0,
          duration: 0.85,
          ease: 'power2.out',
        },
        0
      );

      tl.to(
        innerRingRef.current,
        {
          strokeDashoffset: 0,
          duration: 0.75,
          ease: 'power2.out',
        },
        0.15
      );

      tl.to(
        ellipse1Ref.current,
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: 'power2.out',
        },
        0.3
      );

      tl.to(
        ellipse2Ref.current,
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: 'power2.out',
        },
        0.45
      );

      tl.to(
        axisRef.current,
        {
          strokeDashoffset: 0,
          duration: 0.55,
          ease: 'power2.out',
        },
        0.55
      );

      tl.to(
        [nodeCenterRef.current, nodeTopRef.current, nodeBottomRef.current],
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: 'back.out(2)',
        },
        0.8
      );

      // Brief settle delay before hand-off
      tl.to({}, { duration: 0.25 });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08060D] select-none"
    >
      {/* Subtle void radial glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />

      {/* Animated Vector Logo */}
      <div className="relative w-40 h-40 sm:w-52 sm:h-52">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full filter drop-shadow-[0_0_25px_rgba(164,114,247,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle
            ref={outerRingRef}
            cx="150"
            cy="150"
            r="125"
            stroke="#A472F7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="18 10"
            opacity="0"
          />

          {/* Inner Ring */}
          <circle
            ref={innerRingRef}
            cx="150"
            cy="150"
            r="95"
            stroke="#7F45DB"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0"
          />

          {/* Ellipse 1 (Rotated -35 deg) */}
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
              opacity="0"
            />
          </g>

          {/* Ellipse 2 (Rotated 35 deg) */}
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
              opacity="0"
            />
          </g>

          {/* Central Axis Line (Diagonal Axis) */}
          <line
            ref={axisRef}
            x1="90"
            y1="270"
            x2="210"
            y2="30"
            stroke="#E9D5FF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0"
          />

          {/* Nodes */}
          <circle
            ref={nodeTopRef}
            cx="210"
            cy="30"
            r="6"
            fill="#A472F7"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <circle
            ref={nodeCenterRef}
            cx="150"
            cy="150"
            r="10"
            fill="#9333EA"
            stroke="#F3E8FF"
            strokeWidth="2.5"
          />
          <circle
            ref={nodeBottomRef}
            cx="90"
            cy="270"
            r="6"
            fill="#A472F7"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
