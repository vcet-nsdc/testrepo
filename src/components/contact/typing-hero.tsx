'use client';

import { useState, useEffect, useRef } from 'react';

const PHRASES: readonly string[] = [
  "Say hello to us and shape what's next.",
  "Let's build something extraordinary together.",
  "Start the conversation with our AI council.",
  "Your next breakthrough idea starts right here.",
  "Connect directly with the VCET NSDC team.",
  "Reach the minds engineering the next chapter.",
  "Message our student innovation desk anytime.",
];

export function TypingHero() {
  const [displayText, setDisplayText] = useState<string>(PHRASES[0] ?? '');
  const phraseIdxRef = useRef(0);
  const charIdxRef = useRef((PHRASES[0] ?? '').length);
  const isDeletingRef = useRef(true); // Start by holding the initial phrase, then deleting smoothly
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function runTypingCycle() {
      const phrase = PHRASES[phraseIdxRef.current] ?? PHRASES[0] ?? '';

      if (!isDeletingRef.current) {
        // Typing forward
        charIdxRef.current += 1;
        setDisplayText(phrase.slice(0, charIdxRef.current));

        if (charIdxRef.current >= phrase.length) {
          // Reached the end of the phrase -> hold for 1.6 seconds
          isDeletingRef.current = true;
          timerRef.current = setTimeout(runTypingCycle, 1600);
          return;
        }

        const lastChar = phrase[charIdxRef.current - 1];
        let delay = Math.floor(Math.random() * 25) + 50; // 50-75ms natural variance
        if (lastChar === ',') delay += 260;
        else if (lastChar === '.' && charIdxRef.current < phrase.length) delay += 380;

        timerRef.current = setTimeout(runTypingCycle, delay);
      } else {
        // Deleting characters
        charIdxRef.current -= 1;
        setDisplayText(phrase.slice(0, charIdxRef.current));

        if (charIdxRef.current <= 0) {
          // Fully deleted -> move to the next phrase
          isDeletingRef.current = false;
          phraseIdxRef.current = (phraseIdxRef.current + 1) % PHRASES.length;
          timerRef.current = setTimeout(runTypingCycle, 220);
          return;
        }

        const delay = Math.floor(Math.random() * 15) + 32; // 32-47ms deletion speed
        timerRef.current = setTimeout(runTypingCycle, delay);
      }
    }

    // Initial hold time for the first phrase
    timerRef.current = setTimeout(() => {
      runTypingCycle();
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-headline-wrap reveal-motion reveal-d1">
        <h1 className="hero-headline" aria-label="Say hello to us and shape what's next.">
          <span className="typing-text">{displayText}</span>
          <span className="typing-cursor" aria-hidden="true" />
        </h1>
      </div>

      <p className="hero-description reveal-motion reveal-d2">
        <span className="white-shimmer-text">
          Reach out directly regarding hackathon collaborations, technical workshops, or student initiatives in VCET&apos;s Artificial Intelligence &amp; Data Science department.
        </span>
      </p>
    </section>
  );
}
