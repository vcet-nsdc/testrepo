// components/ui/expandable-card.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { X, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExpandableCardProps {
  title: string;
  src: string;
  description: string;
  date?: string | undefined;
  time?: string | undefined;
  venue?: string | undefined;
  category?: string | undefined;
  tagline?: string | undefined;
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  classNameExpanded?: string | undefined;
  footer?: React.ReactNode | undefined;
  badge?: React.ReactNode | undefined;
  [key: string]: any;
}

export function ExpandableCard({
  title,
  src,
  description,
  date,
  time,
  venue,
  category,
  tagline,
  children,
  className,
  classNameExpanded,
  footer,
  badge,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const cardOuterRef = React.useRef<HTMLDivElement>(null);
  const cardRectRef = React.useRef<DOMRect | null>(null);

  // High-performance 3D perspective tilt via useMotionValue & useSpring (GPU accelerated at 120fps, zero re-renders)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 320, damping: 26, mass: 0.15 });
  const mouseYSpring = useSpring(y, { stiffness: 320, damping: 26, mass: 0.15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["18deg", "-18deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-18deg", "18deg"]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    cardRectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRectRef.current || e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    cardRectRef.current = null;
    x.set(0);
    y.set(0);
  };

  // Derive intelligent category and clean tagline if not explicitly provided
  const derivedCategory = React.useMemo(() => {
    if (category) return category;
    const combined = `${title} ${description}`.toLowerCase();
    if (combined.includes("workshop") || combined.includes("training")) return "WORKSHOP";
    if (combined.includes("hackathon") || combined.includes("arena")) return "HACKATHON";
    if (combined.includes("bootcamp")) return "BOOTCAMP";
    if (combined.includes("seminar") || combined.includes("lecture")) return "SEMINAR";
    if (combined.includes("showcase") || combined.includes("expo")) return "SHOWCASE";
    if (combined.includes("paper") || combined.includes("symposium") || combined.includes("oscillations")) return "SYMPOSIUM";
    if (combined.includes("competition") || combined.includes("challenge") || combined.includes("battle") || combined.includes("sprint")) return "COMPETITION";
    if (combined.includes("inauguration") || combined.includes("launch")) return "LAUNCH";
    return "FLAGSHIP EVENT";
  }, [category, title, description]);

  const derivedTagline = React.useMemo(() => {
    if (tagline) return tagline;
    if (description.includes("•")) {
      const parts = description.split("•");
      if (parts[0]) return parts[0].trim();
    }
    return description;
  }, [tagline, description]);

  const formattedTagline = React.useMemo(() => {
    const raw = derivedTagline || "Turn Ideas into Impact";
    return raw.toUpperCase();
  }, [derivedTagline]);

  const formattedDate = React.useMemo(() => {
    return (date || "Upcoming").toUpperCase();
  }, [date]);

  const venuePrimary = React.useMemo(() => {
    if (!venue) return "Main Auditorium";
    const parts = venue.split(",");
    const primary = parts[0]?.trim();
    return primary || "Main Auditorium";
  }, [venue]);

  const venueSecondary = React.useMemo(() => {
    if (!venue) return "Tech Campus";
    const parts = venue.split(",");
    if (parts.length > 1 && parts[1]?.trim()) {
      return parts.slice(1).join(", ").trim();
    }
    return "Tech Campus";
  }, [venue]);

  // Robust background scroll lock: freezes background position without jumping to top
  React.useEffect(() => {
    if (!active) return;

    document.body.classList.add("modal-open");
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [active]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false);
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Modal Dialog Portaled to Document Body to prevent background scroll interference */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {active && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActive(false)}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md h-full w-full z-[100]"
                />
                <div
                  className="fixed inset-0 grid place-items-center z-[101] p-4 sm:p-6 overflow-y-auto overscroll-contain"
                  onWheel={(e) => e.stopPropagation()}
                  onClick={() => setActive(false)}
                >
                  <motion.div
                    ref={modalRef}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={cn(
                      "w-full max-w-3xl max-h-[88vh] flex flex-col overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] rounded-[32px] bg-gradient-to-b from-[#150a2e]/98 via-[#090416]/98 to-[#130728]/98 backdrop-blur-2xl border-[1.5px] border-purple-400/50 shadow-[0_0_70px_rgba(147,51,234,0.4)] relative my-auto",
                      classNameExpanded
                    )}
                    {...props}
                  >
                    {/* Top specular highlight */}
                    <div className="absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_18px_#c084fc] pointer-events-none z-20" />

                    {/* Modal Banner Image */}
                    <div className="relative">
                      <img
                        src={src}
                        alt={title}
                        className="w-full h-64 sm:h-80 object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090416] via-transparent to-black/30" />

                      {/* Modal Category Pill */}
                      <div className="absolute top-5 left-5 z-20">
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-400/50 bg-[#160a2d]/80 backdrop-blur-md px-4 py-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_10px_#c084fc]" />
                          <span className="text-xs font-mono tracking-[0.25em] font-bold text-white/90 uppercase">
                            {derivedCategory}
                          </span>
                        </div>
                      </div>

                      {/* Close Button */}
                      <button
                        aria-label="Close card"
                        className="absolute top-5 right-5 z-20 h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-purple-500/40 text-purple-200 hover:text-white hover:scale-105 transition"
                        onClick={() => setActive(false)}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="relative p-6 sm:p-8 pt-4">
                      {/* Header with Serif Title and Cosmic Swoosh */}
                      <div className="mb-6">
                        <div className="relative inline-flex items-baseline">
                          <h3 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight bg-gradient-to-b from-white via-[#f3e8ff] to-[#c084fc] bg-clip-text text-transparent leading-none py-0.5">
                            {title}
                          </h3>
                          <div className="relative ml-1 -top-2 sm:-top-3 shrink-0">
                            <svg
                              className="absolute -top-3 -right-3 w-16 sm:w-20 h-10 pointer-events-none overflow-visible"
                              viewBox="0 0 70 36"
                              fill="none"
                            >
                              <ellipse
                                cx="35"
                                cy="18"
                                rx="32"
                                ry="12"
                                stroke="url(#modalOrbitGradient)"
                                strokeWidth="1.2"
                                transform="rotate(-15 35 18)"
                                strokeDasharray="65 25"
                                className="opacity-80"
                              />
                              <defs>
                                <linearGradient id="modalOrbitGradient" x1="0" y1="0" x2="70" y2="36" gradientUnits="userSpaceOnUse">
                                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
                                  <stop offset="50%" stopColor="#f3e8ff" stopOpacity="0.95" />
                                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className="relative z-10 text-white text-base sm:text-lg select-none drop-shadow-[0_0_10px_#e9d5ff]">
                              ✦
                            </span>
                          </div>
                        </div>

                        <p className="text-white/80 font-sans tracking-[0.3em] text-xs sm:text-[13px] font-medium mt-2 uppercase">
                          {formattedTagline}
                        </p>
                      </div>

                      {/* Sparkle Divider */}
                      <div className="flex items-center gap-3 my-5">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-400/40 to-purple-400/70" />
                        <span className="text-purple-300 text-xs select-none drop-shadow-[0_0_8px_#c084fc]">
                          ✦
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-400/70 via-purple-400/40 to-transparent" />
                      </div>

                      <div className="text-zinc-300 text-base leading-relaxed space-y-4">
                        {children}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Closed Card with 3D Perspective Floating Hover Effect & Precise Framed Mockup UI */}
      <div style={{ perspective: "1000px" }} className="w-full h-full">
        <motion.div
          ref={cardOuterRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{
            scale: 1.04,
            translateZ: 30,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          onClick={() => setActive(true)}
          className={cn(
            "group relative flex flex-col rounded-[32px] border-[1.5px] border-purple-400/50 bg-gradient-to-b from-[#150a2e]/95 via-[#090416]/98 to-[#130728]/98 backdrop-blur-2xl cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(168,85,247,0.3),inset_0_0_20px_rgba(168,85,247,0.1)] transition-shadow duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_60px_rgba(168,85,247,0.55),inset_0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-300/80 select-none",
            className
          )}
        >
          {/* Top specular neon edge bloom */}
          <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_18px_#c084fc] pointer-events-none z-20" />

          {/* Left edge glint flare */}
          <div className="absolute -left-[1px] top-1/4 w-[2px] h-14 bg-gradient-to-b from-transparent via-purple-300 to-transparent shadow-[0_0_12px_#c084fc] pointer-events-none z-20" />

          {/* Right edge glint flare */}
          <div className="absolute -right-[1px] top-1/3 w-[2px] h-14 bg-gradient-to-b from-transparent via-purple-300 to-transparent shadow-[0_0_12px_#c084fc] pointer-events-none z-20" />

          {/* Bottom edge neon flare */}
          <div className="absolute bottom-0 inset-x-20 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#a855f7] pointer-events-none z-20" />

          {/* Ambient outer glow aura on hover */}
          <div
            className="absolute -inset-1 rounded-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm"
            style={{
              boxShadow: "0 0 50px 4px rgba(168, 85, 247, 0.6)",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.6), transparent 75%)",
            }}
          />

          {/* Floating blur orb with translateZ */}
          <div
            className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-40 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-700"
            style={{ transform: "translateZ(15px)" }}
          />

          {/* Top Pill Badge (top-left, uppercase, glowing dot) */}
          <div
            className="pt-4 sm:pt-5 px-5 sm:px-6 z-20 flex items-center justify-between"
            style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-400/50 bg-[#160a2d]/70 backdrop-blur-md px-3.5 py-1 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:border-purple-300/70 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_10px_#c084fc] animate-pulse" />
              <span className="text-xs font-mono tracking-[0.25em] font-bold text-white/90 uppercase">
                {derivedCategory}
              </span>
            </div>
            {badge}
          </div>

          {/* Framed Image Container - Cinematic Wide Aspect Ratio */}
          <div
            className="px-5 sm:px-6 pt-3 pb-0 z-10"
            style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}
          >
            <div className="w-full aspect-[16/8.5] max-h-52 rounded-[20px] overflow-hidden border border-purple-500/30 bg-[#120726]/60 relative shadow-inner group-hover:border-purple-400/50 transition-colors">
              <img
                src={src}
                alt={title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Card Content (Title with Orbital Swoosh, Tagline, Divider, Metadata, Accents) */}
          <div
            className="p-5 sm:p-6 pt-3 pb-4 flex flex-col justify-between flex-1 relative z-10"
            style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}
          >
            <div>
              {/* Title with Serif Font and Orbital Swoosh */}
              <div className="relative inline-flex items-baseline">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight bg-gradient-to-b from-white via-[#f3e8ff] to-[#c084fc] bg-clip-text text-transparent leading-none py-0.5 group-hover:brightness-110 transition-all">
                  {title}
                </h3>
                <div className="relative ml-1 -top-2 shrink-0">
                  <svg
                    className="absolute -top-3 -right-3 w-16 sm:w-20 h-10 pointer-events-none overflow-visible"
                    viewBox="0 0 70 36"
                    fill="none"
                  >
                    <ellipse
                      cx="35"
                      cy="18"
                      rx="32"
                      ry="12"
                      stroke="url(#cardOrbitGradient)"
                      strokeWidth="1.2"
                      transform="rotate(-15 35 18)"
                      strokeDasharray="65 25"
                      className="opacity-80"
                    />
                    <defs>
                      <linearGradient id="cardOrbitGradient" x1="0" y1="0" x2="70" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#f3e8ff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="relative z-10 text-white text-base sm:text-lg select-none drop-shadow-[0_0_10px_#e9d5ff]">
                    ✦
                  </span>
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <p className="text-white/80 font-sans tracking-[0.25em] text-xs sm:text-[13px] font-medium mt-1.5 uppercase line-clamp-1">
                {formattedTagline}
              </p>
            </div>

            {/* Sparkle Divider (― ✦ ―) */}
            <div className="flex items-center gap-3 my-3 sm:my-3.5">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-400/40 to-purple-400/70" />
              <span className="text-purple-300 text-xs select-none drop-shadow-[0_0_8px_#c084fc]">
                ✦
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-400/70 via-purple-400/40 to-transparent" />
            </div>

            {/* Two-Column Metadata Section: Date & Location */}
            <div
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-0.5"
              style={{ transform: "translateZ(45px)" }}
            >
              {/* Left Column: Date & Time */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full border border-purple-400/50 bg-[#1a0c33]/70 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                  <Calendar className="w-4.5 h-4.5 text-purple-200" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wider leading-tight">
                    {formattedDate}
                  </span>
                  <span className="text-[11px] font-mono text-purple-300/80 tracking-wide mt-0.5 leading-tight">
                    {time || "10:00 AM – 1:00 PM"}
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-[1px] h-9 bg-purple-400/30 shrink-0 mx-1" />

              {/* Right Column: Venue & Campus */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full border border-purple-400/50 bg-[#1a0c33]/70 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                  <MapPin className="w-4.5 h-4.5 text-purple-200" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight truncate">
                    {venuePrimary}
                  </span>
                  <span className="text-[11px] font-sans text-purple-300/80 tracking-wide mt-0.5 leading-tight truncate">
                    {venueSecondary}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Accent: Three Stars (✦ ✦ ✦), horizontal rule & Explore action */}
            <div
              className="mt-3.5 pt-1 flex items-center justify-between gap-3 text-xs text-purple-300/80"
              style={{ transform: "translateZ(45px)" }}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-purple-300 text-xs tracking-widest select-none flex items-center gap-1.5 drop-shadow-[0_0_8px_#c084fc]">
                  <span>✦</span>
                  <span>✦</span>
                  <span>✦</span>
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-400/40 via-purple-400/20 to-transparent" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-purple-200/90 group-hover:text-white group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Details &rarr;
                </span>
                {footer}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
