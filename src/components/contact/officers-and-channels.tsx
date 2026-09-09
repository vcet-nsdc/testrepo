'use client';

import { useState } from 'react';

interface OfficersAndChannelsProps {
  onShowToast: (msg: string) => void;
}

export function OfficersAndChannels({ onShowToast }: OfficersAndChannelsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onShowToast(`Copied ${text}`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      onShowToast('Could not copy to clipboard');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--card-mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--card-mouse-y', `${y}px`);
  };

  return (
    <aside className="left-stack reveal-motion reveal-d3">
      {/* Officers Card */}
      <div className="clean-card" onMouseMove={handleMouseMove}>
        <div className="card-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Key Chapter Officers
        </div>

        <div className="people-rows">
          {/* Chairperson */}
          <div className="person-entry">
            <span className="person-role">Chairperson</span>
            <div className="person-title-row">
              <div className="person-name">James Lewis</div>
              <a
                href="https://www.instagram.com/jamesjlewis_/"
                target="_blank"
                rel="noreferrer"
                className="person-social-link"
                aria-label="James Lewis Instagram"
                title="Instagram @jamesjlewis_"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
            <div className="email-action-row">
              <a
                className="person-email-link"
                href="mailto:james.236127101@vcet.edu.in"
              >
                james.236127101@vcet.edu.in
              </a>
              <button
                type="button"
                className={`copy-chip ${copiedKey === 'chairperson' ? 'copied' : ''}`}
                onClick={() => handleCopy('james.236127101@vcet.edu.in', 'chairperson')}
                aria-label="Copy chairperson email"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span className="chip-label">
                  {copiedKey === 'chairperson' ? 'Copied' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Secretary */}
          <div className="person-entry">
            <span className="person-role">Secretary</span>
            <div className="person-title-row">
              <div className="person-name">Shruti Gauchandra</div>
              <a
                href="https://www.instagram.com/shruti.___g/"
                target="_blank"
                rel="noreferrer"
                className="person-social-link"
                aria-label="Shruti Gauchandra Instagram"
                title="Instagram @shruti.___g"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
            <div className="email-action-row">
              <a
                className="person-email-link"
                href="mailto:shruti.235997201@vcet.edu.in"
              >
                shruti.235997201@vcet.edu.in
              </a>
              <button
                type="button"
                className={`copy-chip ${copiedKey === 'secretary' ? 'copied' : ''}`}
                onClick={() => handleCopy('shruti.235997201@vcet.edu.in', 'secretary')}
                aria-label="Copy secretary email"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span className="chip-label">
                  {copiedKey === 'secretary' ? 'Copied' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Central Desk */}
          <div className="person-entry">
            <span className="person-role">Central Desk</span>
            <div className="person-title-row">
              <div className="person-name">VCET NSDC Council</div>
            </div>
            <div className="email-action-row">
              <a
                className="person-email-link"
                href="mailto:nsdc@vcet.edu.in"
              >
                nsdc@vcet.edu.in
              </a>
              <button
                type="button"
                className={`copy-chip ${copiedKey === 'desk' ? 'copied' : ''}`}
                onClick={() => handleCopy('nsdc@vcet.edu.in', 'desk')}
                aria-label="Copy council email"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span className="chip-label">
                  {copiedKey === 'desk' ? 'Copied' : 'Copy'}
                </span>
              </button>
            </div>
            <a className="person-phone-link" href="tel:+919370548210">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +91 93705 48210
            </a>
          </div>
        </div>
      </div>

      {/* Official Channels */}
      <div className="clean-card" onMouseMove={handleMouseMove}>
        <div className="card-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Channels
        </div>
        <div className="channel-links">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="channel-link"
          >
            <span>LinkedIn &middot; @vcet-nsdc</span>
            <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="channel-link"
          >
            <span>Instagram &middot; @vcet_nsdc</span>
            <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="channel-link"
          >
            <span>GitHub &middot; vcet-nsdc-org</span>
            <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}
