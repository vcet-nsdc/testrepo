"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  Award,
  Sparkles,
  Globe,
  ArrowRight,
  Users,
} from "lucide-react";

interface EventCardProps {
  title: string;
  dateTime: string;
  venue: string;
  shortDescription: string;
  imagePath: string | StaticImageData;
  logoPath?: string | StaticImageData;
  overview: string;
  highlights: string[];
  awards: string[];
  websiteLink?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  dateTime,
  venue,
  shortDescription,
  imagePath,
  logoPath,
  overview,
  highlights,
  awards,
  websiteLink,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Motion physics for 3D parallax tilt & spotlight (Zero React re-renders)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 280, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig);

  const spotlightXSpring = useSpring(spotlightX, { damping: 20, stiffness: 300 });
  const spotlightYSpring = useSpring(spotlightY, { damping: 20, stiffness: 300 });
  const spotlightOpacity = useSpring(isHovered, { damping: 20, stiffness: 200 });

  const spotlightBackground = useMotionTemplate`radial-gradient(550px circle at ${spotlightXSpring}px ${spotlightYSpring}px, rgba(236, 72, 153, 0.18), rgba(168, 85, 247, 0.1), transparent 65%)`;
  const borderSpotlight = useMotionTemplate`radial-gradient(350px circle at ${spotlightXSpring}px ${spotlightYSpring}px, rgba(244, 114, 182, 0.5), rgba(168, 85, 247, 0.3), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / rect.width);
    mouseY.set(y / rect.height);
    spotlightX.set(x);
    spotlightY.set(y);
    isHovered.set(1);
  };

  const handleMouseEnter = () => {
    if (!isExpanded) isHovered.set(1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    isHovered.set(0);
  };

  // Escape key listener & body scroll lock (without layout shifts or jumps)
  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      window.addEventListener("keydown", onKeyDown);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove("modal-open");
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove("modal-open");
    };
  }, [isExpanded]);

  return (
    <>
      {/* 3D Parallax Tilt & Spotlight Border Glassmorphism Card */}
      <div
        className="w-full max-w-4xl mx-auto group"
        style={{ perspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={cardRef}
          onClick={() => setIsExpanded(true)}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative rounded-[28px] cursor-pointer p-[1px] transition-shadow duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_25px_65px_rgba(0,0,0,0.75),0_0_50px_rgba(236,72,153,0.3)]"
        >
          {/* Spotlight Border (Illuminates glass edge following the cursor) */}
          <motion.div
            className="absolute inset-0 rounded-[28px] pointer-events-none transition-opacity duration-300 z-0"
            style={{
              background: borderSpotlight,
              opacity: spotlightOpacity,
            }}
          />

          {/* Static Iridescent Glass Border Baseline */}
          <div className="absolute inset-0 rounded-[28px] border border-white/15 group-hover:border-white/25 transition-colors duration-300 pointer-events-none z-0" />

          {/* Main Glassmorphism Body */}
          <div className="relative rounded-[27px] overflow-hidden bg-[#110724]/80 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4)] z-10">
            {/* Ambient Internal Glow Orbs */}
            <div className="absolute -top-32 -left-20 w-80 h-80 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-purple-950/25 pointer-events-none" />

            {/* Dynamic Glass Surface Specular Spotlight */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: spotlightBackground,
                opacity: spotlightOpacity,
              }}
            />

            {/* Top Hairline Specular Reflection */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/45 to-transparent pointer-events-none z-20" />

            {/* "ONGOING EVENT" Floating Glass Pill */}
            <div className="absolute top-4 left-5 z-30 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/65 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.35)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-pink-200">
                  Ongoing Event
                </span>
              </div>
            </div>

            {/* Quick Click Hint Badge on top right */}
            <div className="absolute top-4 right-5 z-30 pointer-events-none max-sm:hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[11px] font-body text-purple-200/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-sm">
                Click for full details ↗
              </span>
            </div>

            <div className="flex flex-col md:flex-row h-auto min-h-[19rem] relative z-20">
              {/* Event Artwork Section (Framed in Frosted Glass Bevel) */}
              <div className="w-full md:w-[42%] p-4 sm:p-5 flex items-center justify-center shrink-0">
                <div className="relative w-full h-64 md:h-full min-h-[16.5rem] rounded-2xl overflow-hidden border border-white/15 shadow-inner group/art">
                  <Image
                    src={imagePath || "/assests/image.png"}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 42vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#110724]/85 via-transparent to-black/30 pointer-events-none" />
                  <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>

              {/* Event Info Section */}
              <div className="w-full md:w-[58%] p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  {/* Event Logo / Title */}
                  <div className="relative h-16 md:h-20 w-full flex items-center justify-start mb-3">
                    {logoPath ? (
                      <div className="relative w-48 md:w-56 h-full transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src={logoPath}
                          alt={title}
                          fill
                          className="object-contain object-left drop-shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </div>
                    ) : (
                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tight drop-shadow-md">
                        {title}
                      </h3>
                    )}
                  </div>

                  {/* Glass Meta Chips (Date & Venue) */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs font-heading text-purple-200 shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>{dateTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs font-heading text-purple-200 shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>{venue}</span>
                    </div>
                  </div>

                  {/* Sponsors Glass Pill */}
                  <div className="flex flex-wrap items-center gap-2 p-1.5 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 backdrop-blur-md mb-3 w-fit hover:border-purple-500/30 transition-colors">
                    <div className="relative w-14 h-7 bg-white/95 rounded-lg p-1 flex items-center justify-center shadow-sm shrink-0">
                      <Image src="/assests/sponsor_tech_computer.png" alt="Tech Computer Education" fill className="object-contain p-0.5" />
                    </div>
                    <span className="text-white/90 text-xs font-heading">
                      Powered by <strong className="text-purple-300 font-semibold">Tech Computer Education</strong>
                    </span>
                  </div>

                  {/* Website Link on Card (if available) */}
                  {websiteLink && (
                    <div className="mb-3">
                      <a
                        href={websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-fuchsia-500/30 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-heading font-medium transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] group/link"
                        title="Open Event Website"
                      >
                        <Globe className="w-3.5 h-3.5 text-purple-400 group-hover/link:rotate-12 transition-transform duration-300" />
                        <span className="font-semibold underline-offset-2 group-hover/link:underline">
                          {websiteLink.replace(/^https?:\/\//, '')}
                        </span>
                        <ExternalLink className="w-3 h-3 text-purple-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  )}

                  <p className="text-purple-100/90 text-xs sm:text-[13px] leading-relaxed line-clamp-2 font-body">
                    {shortDescription}
                  </p>
                </div>

                {/* Glass Bottom Bar with Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-[11px] text-purple-300/80 font-body">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Product Showcase • VCET Vasai</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {websiteLink ? (
                      <a
                        href={websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-liquid-purple text-xs !py-1.5 !px-3.5"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3.5 h-3.5 no-shift" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-300 text-[11px] font-heading font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Portal Coming Soon</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsExpanded(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-heading text-white px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-sm font-medium active:scale-95"
                    >
                      <span>More Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expanded State: Smooth Spring Frosted Glass Modal Popup */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isExpanded && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                {/* Backdrop Scrim */}
                <motion.div
                  key="modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md"
                  onClick={() => setIsExpanded(false)}
                />

                {/* Expanded Card Modal (Frosted Glass Theme) */}
                <motion.div
                  key="modal-dialog"
                  initial={{ opacity: 0, scale: 0.93, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  transition={{
                    type: "spring",
                    damping: 28,
                    stiffness: 360,
                    mass: 0.7,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.25)] flex flex-col bg-[#110724]/92 backdrop-blur-2xl"
                >
                  {/* Top hairline specular highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />

                  {/* Close button */}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute top-4 right-4 sm:top-5 sm:right-6 text-fuchsia-200 hover:text-white bg-black/60 hover:bg-black/80 rounded-full p-2 border border-white/15 transition-all duration-200 z-30 focus:outline-none backdrop-blur-md"
                    aria-label="Close details"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header Banner */}
                  <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden">
                    <Image
                      src={imagePath || "/assests/image.png"}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 850px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#110724] via-transparent to-black/60 pointer-events-none" />

                    {/* Badge */}
                    <div className="absolute top-5 left-6 z-20">
                      <span className="inline-flex items-center gap-2 bg-pink-600/90 backdrop-blur-md text-white text-xs font-heading font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Ongoing Event
                      </span>
                    </div>

                    {/* Logo/Title floating on banner bottom */}
                    <div className="absolute bottom-4 left-6 right-6 z-20 flex items-end justify-between">
                      <div className="relative h-16 sm:h-20 w-52 sm:w-64">
                        {logoPath ? (
                          <Image
                            src={logoPath}
                            alt={title}
                            fill
                            className="object-contain object-left drop-shadow-[0_0_25px_rgba(236,72,153,0.4)]"
                            sizes="300px"
                          />
                        ) : (
                          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white drop-shadow-md">
                            {title}
                          </h2>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Detail Body */}
                  <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.4)_transparent]">
                    {/* Date, Venue, Team stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/10 text-sm">
                      <div className="space-y-1 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <p className="text-fuchsia-300 text-xs font-body uppercase tracking-wider">Date & Time</p>
                        <p className="text-white font-heading font-semibold text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-violet-400" />
                          {dateTime}
                        </p>
                      </div>
                      <div className="space-y-1 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                        <p className="text-fuchsia-300 text-xs font-body uppercase tracking-wider">Venue</p>
                        <p className="text-white font-heading font-semibold text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-pink-400" />
                          {venue}
                        </p>
                      </div>
                    </div>

                    {/* Overview */}
                    <div>
                      <h4 className="text-fuchsia-300 text-xs font-body uppercase tracking-wider mb-2">Overview</h4>
                      <p className="text-fuchsia-100 text-sm md:text-base leading-relaxed font-body">
                        {overview}
                      </p>
                    </div>

                    {/* Sponsors & Partners section */}
                    <div>
                      <h4 className="text-purple-300 text-xs font-body uppercase tracking-wider mb-2">Event Sponsors & Partners</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 bg-white/[0.05] rounded-xl p-3 border border-white/10 backdrop-blur-md">
                          <div className="relative w-16 h-10 bg-white flex items-center justify-center rounded-lg overflow-hidden p-1 shadow-sm shrink-0">
                            <Image src="/assests/sponsor_tech_computer.png" alt="Tech Computer Education" fill className="object-contain" />
                          </div>
                          <div>
                            <span className="text-white text-xs font-heading font-semibold block leading-tight">
                              Tech Computer Education
                            </span>
                            <span className="text-[10px] text-red-300 font-mono">Powered By</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/[0.05] rounded-xl p-3 border border-white/10 backdrop-blur-md">
                          <div className="relative w-16 h-10 bg-white flex items-center justify-center rounded-lg overflow-hidden p-1 shadow-sm shrink-0">
                            <Image src="/assests/sponsor_angelone.png" alt="AngelOne" fill className="object-contain" />
                          </div>
                          <div>
                            <span className="text-white text-xs font-heading font-semibold block leading-tight">
                              AngelOne
                            </span>
                            <span className="text-[10px] text-amber-300 font-mono">Co-Powered By</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/[0.05] rounded-xl p-3 border border-white/10 backdrop-blur-md">
                          <div className="relative w-16 h-10 bg-white flex items-center justify-center rounded-lg overflow-hidden p-1 shadow-sm shrink-0">
                            <Image src="/assests/sponsor_career_launcher.png" alt="Career Launcher" fill className="object-contain" />
                          </div>
                          <div>
                            <span className="text-white text-xs font-heading font-semibold block leading-tight">
                              Career Launcher
                            </span>
                            <span className="text-[10px] text-amber-300 font-mono">Co-Powered By</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlights & Awards */}
                    <div className="grid sm:grid-cols-2 gap-6 pt-2">
                      <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/10">
                        <h4 className="text-fuchsia-300 text-sm font-heading font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          Highlights
                        </h4>
                        <ul className="space-y-2 text-xs md:text-sm text-fuchsia-100 font-body">
                          {highlights.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/10">
                        <h4 className="text-fuchsia-300 text-sm font-heading font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-pink-400" />
                          Awards & Recognition
                        </h4>
                        <ul className="space-y-2 text-xs md:text-sm text-fuchsia-100 font-body">
                          {awards.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Participation badges & modal footer (website is on the card itself) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200">
                        <span className="bg-fuchsia-900/40 text-fuchsia-200 px-3 py-1 rounded-full border border-fuchsia-500/30">
                          Teams • Open to all
                        </span>
                        <span className="bg-purple-900/40 text-purple-200 px-3 py-1 rounded-full border border-purple-500/30">
                          Trophy + Certificates
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-xs font-heading font-medium transition-colors border border-white/15 backdrop-blur-md"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default EventCard;
