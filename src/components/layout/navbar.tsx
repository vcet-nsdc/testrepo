/**
 * Navigation Bar Component
 * Clean, lightweight, synchronized with the top dot reveal on homepage
 * and instantaneous display on subpages.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAVIGATION } from '@/lib/constants';
import { getHasPlayedIntro } from '@/lib/introState';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isVisible, setIsVisible] = useState(!isHomePage || getHasPlayedIntro());

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    const handleReveal = () => {
      setIsVisible(true);
    };

    window.addEventListener('nsdc-navbar-reveal', handleReveal);
    window.addEventListener('nsdc-navbar-seed', handleReveal);
    window.addEventListener('nsdc-navbar-ascend', handleReveal);
    window.addEventListener('nsdc-hero-locked', handleReveal);

    return () => {
      window.removeEventListener('nsdc-navbar-reveal', handleReveal);
      window.removeEventListener('nsdc-navbar-seed', handleReveal);
      window.removeEventListener('nsdc-navbar-ascend', handleReveal);
      window.removeEventListener('nsdc-hero-locked', handleReveal);
    };
  }, [isHomePage]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      {/* Sleek Pill Navbar Container (Enlarged) */}
      <div
        className={cn(
          'fixed top-5 left-1/2 -translate-x-1/2 pointer-events-auto w-[94%] max-w-5xl h-18 sm:h-20 rounded-full border border-white/[0.12] bg-[#0A0612]/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] shadow-purple-900/10 flex items-center justify-between px-6 sm:px-9 transition-all duration-700 ease-out',
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center select-none group shrink-0">
          <div className="h-12 sm:h-14 w-auto relative flex items-center">
            <Image
              src="/assests/white%20NSDC%20logo.png"
              alt="VCET NSDC logo"
              width={180}
              height={50}
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-10 sm:gap-12 text-base sm:text-lg font-sans">
          {NAVIGATION.main.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-slate-200 hover:text-white hover:drop-shadow-[0_0_12px_#A472F7] transition-all duration-200 font-medium tracking-wide"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden pointer-events-auto text-slate-200 hover:text-white p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={cn(
          'md:hidden fixed top-26 sm:top-28 left-4 right-4 z-40 transition-all duration-300',
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
      >
        <div className="bg-[#0A0612]/95 backdrop-blur-2xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl">
          <ul className="space-y-4 font-sans">
            {NAVIGATION.main.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block text-slate-200 hover:text-purple-300 transition-colors duration-200 font-medium py-2 text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
