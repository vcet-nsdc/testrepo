'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TypingHero } from './typing-hero';
import { OfficersAndChannels } from './officers-and-channels';
import { ContactForm } from './contact-form';
import { OrbitalLocationMap } from './orbital-location-map';

export function ContactView() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const xOff = (e.clientX / window.innerWidth - 0.5) * 36;
      const yOff = (e.clientY / window.innerHeight - 0.5) * 22;
      glowRef.current.style.transform = `translateX(calc(-50% + ${xOff}px)) translateY(${yOff}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Minimal Ambient Glow with Subtle Parallax */}
      <div className="ambient-top-glow" ref={glowRef} />

      <main>
        <div className="content-wrap">
          {/* Continuous Premium Typing Hero Headline */}
          <TypingHero />

          {/* MAIN 2-COLUMN LAYOUT */}
          <div className="main-layout" id="team">
            <OfficersAndChannels onShowToast={showToast} />
            <ContactForm onShowToast={showToast} />
            <OrbitalLocationMap />
          </div>
        </div>
      </main>

      {/* FLOATING TOAST */}
      <div id="toast" className={toastMessage ? 'show' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toast-text">{toastMessage || 'Copied to clipboard'}</span>
      </div>
    </>
  );
}
