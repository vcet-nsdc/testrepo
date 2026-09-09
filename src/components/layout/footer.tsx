'use client';

import { useState } from 'react';
import './footer.css';

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('nsdc@vcet.edu.in');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <footer className="upgraded-footer" id="footer">
      <div className="content-wrap footer-content-wrap">
        {/* 4-Column Grid */}
        <div className="footer-main-grid">
          {/* Col 1: About Us */}
          <div className="footer-block col-about">
            <div className="footer-block-header">
              <h3 className="footer-heading">About Us</h3>
              <div className="heading-accent-line" />
            </div>
            <p className="footer-text">
              <span className="white-shimmer-text">
                The Official NSDC Student Chapter of VCET&apos;s Artificial Intelligence and Data Science Department provides a community to support Artificial Intelligence &amp; Data Science learners of all ages, backgrounds and skills.
              </span>
            </p>
          </div>

          {/* Col 2: Address */}
          <div className="footer-block col-address">
            <div className="footer-block-header">
              <h3 className="footer-heading">Address</h3>
              <div className="heading-accent-line" />
            </div>
            <div className="address-box">
              <div className="address-line institution">
                <span className="white-shimmer-text">Vidyavardhini&apos;s College Of Engineering and Technology, K.T. Marg,</span>
              </div>
              <div className="address-line campus">
                <span className="white-shimmer-text">Vartak College Campus, Vasai Road (W),</span>
              </div>
              <div className="address-line city">
                <span className="white-shimmer-text">Vasai-Virar, Maharashtra 401202</span>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Vidyavardhini's+College+of+Engineering+and+Technology+Vasai"
              target="_blank"
              rel="noreferrer"
              className="footer-map-link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Locate on Google Maps</span>
              <svg className="ext-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>

          {/* Col 3: Quick Links */}
          <div className="footer-block col-links">
            <div className="footer-block-header">
              <h3 className="footer-heading">Quick Links</h3>
              <div className="heading-accent-line" />
            </div>
            <ul className="quick-links-nav">
              <li>
                <a href="#home" className="quick-link-item">
                  <span className="link-chevron">&#8250;</span> Home
                </a>
              </li>
              <li>
                <a href="/events" className="quick-link-item">
                  <span className="link-chevron">&#8250;</span> Events
                </a>
              </li>
              <li>
                <a href="/team" className="quick-link-item">
                  <span className="link-chevron">&#8250;</span> Team
                </a>
              </li>
              <li>
                <a href="/contact" className="quick-link-item">
                  <span className="link-chevron">&#8250;</span> Contact
                </a>
              </li>
              <li>
                <a href="/socials" className="quick-link-item">
                  <span className="link-chevron">&#8250;</span> Socials
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="footer-block col-contact" id="footer-socials">
            <div className="footer-block-header">
              <h3 className="footer-heading">Contact Us</h3>
              <div className="heading-accent-line" />
            </div>

            {/* Gmail Pill with Official Colors & Copy */}
            <div className="gmail-card">
              <div className="gmail-info">
                <svg className="gmail-emblem" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22 6.5l-10 6.5L2 6.5V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.5z" />
                  <path fill="#34A853" d="M2 7.8V19a2 2 0 0 0 2 2h3.5v-9.5L2 7.8z" />
                  <path fill="#FBBC05" d="M22 7.8L16.5 11.5V21H20a2 2 0 0 0 2-2V7.8z" />
                  <path fill="#EA4335" d="M12 13L2 6.5 4 5l8 5.2L20 5l2 1.5L12 13z" />
                </svg>
                <a href="mailto:nsdc@vcet.edu.in" className="gmail-address">
                  nsdc@vcet.edu.in
                </a>
              </div>
              <button
                type="button"
                className={`copy-chip ${copied ? 'copied' : ''}`}
                onClick={handleCopyEmail}
                title="Copy email address"
                aria-label="Copy nsdc@vcet.edu.in"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span className="chip-label">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Social Media Badges (FancyButton with Interactive Light-Sweep Shimmer) */}
            <div className="social-badges-row">
              <a
                href="https://www.linkedin.com/in/vcet-nsdc/"
                target="_blank"
                rel="noreferrer"
                className="fancy-btn fancy-btn-indigo"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <div className="fancy-btn-shimmer" />
                <div className="fancy-btn-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </div>
              </a>
              <a
                href="https://www.youtube.com/channel/UCjBw5a7WU00GwkxaTjF9jqg"
                target="_blank"
                rel="noreferrer"
                className="fancy-btn fancy-btn-red"
                aria-label="YouTube"
                title="YouTube"
              >
                <div className="fancy-btn-shimmer" />
                <div className="fancy-btn-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
              </a>
              <a
                href="https://www.instagram.com/vcet.nsdc/"
                target="_blank"
                rel="noreferrer"
                className="fancy-btn fancy-btn-purple"
                aria-label="Instagram"
                title="Instagram"
              >
                <div className="fancy-btn-shimmer" />
                <div className="fancy-btn-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </a>
              <a
                href="https://github.com/vcet-nsdc-org"
                target="_blank"
                rel="noreferrer"
                className="fancy-btn fancy-btn-default"
                aria-label="GitHub"
                title="GitHub"
              >
                <div className="fancy-btn-shimmer" />
                <div className="fancy-btn-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Glowing Divider */}
        <div className="footer-divider-glow" />

        {/* Bottom Credits & Copyright Bar */}
        <div className="footer-bottom-bar">
          {/* Left Credits: Lead Developer, Co-Lead Developers & Team Members */}
          <div className="footer-credits-section">
            <div className="lead-dev-box">
              <span className="lead-dev-tag">LEAD DEVELOPER :</span>
              <span className="lead-dev-name golden-shimmer-text">Suraj Phirke</span>
            </div>
            <div className="co-lead-dev-box">
              <span className="co-lead-dev-tag">CO-LEAD DEVELOPERS :</span>
              <div className="co-lead-names-list">
                <span className="co-lead-name copper-shimmer-text">Naman Pandey</span>
                <span className="co-lead-bullet">&bull;</span>
                <span className="co-lead-name copper-shimmer-text">Madhusudan Chanda</span>
              </div>
            </div>
            <div className="team-members-box">
              <span className="team-dev-tag">TEAM MEMBERS :</span>
              <div className="team-names-list">
                <span className="team-member-name velvet-red-shimmer-text">Vihar Makwana</span>
                <span className="team-bullet">&bull;</span>
                <span className="team-member-name velvet-red-shimmer-text">Varun Poojary</span>
                <span className="team-bullet">&bull;</span>
                <span className="team-member-name velvet-red-shimmer-text">Pratham Mewada</span>
                <span className="team-bullet">&bull;</span>
                <span className="team-member-name velvet-red-shimmer-text">Trushna Wankhede</span>
              </div>
            </div>
          </div>

          {/* Right: Copyright */}
          <div className="footer-copyright-box">
            <span className="copyright-text">
              &copy; {new Date().getFullYear()} VCET. All rights reserved to VCET NSDC.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
