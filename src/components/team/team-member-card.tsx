/**
 * Team Member Card Component
 * Individual team member card with social links
 */

'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import type { TeamMember } from '@/types';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(200);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 220 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 220 });

  const hasSocialLinks = Boolean(member.instagram || member.linkedin || member.email);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clampedX = Math.max(95, Math.min(rect.width - 95, x));
    const clampedY = Math.max(40, Math.min(rect.height - 40, y));

    mouseX.set(clampedX);
    mouseY.set(clampedY);
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6 }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0.8 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8 }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="group relative w-full max-w-[420px] mx-auto rounded-2xl border border-slate-800/60 bg-slate-800/50 backdrop-blur-sm shadow-xl transition-transform duration-300"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-700/20 to-slate-900/40 pointer-events-none" />
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          ref={containerRef}
          className="relative w-full h-[350px] sm:h-[400px] overflow-hidden"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(95, Math.min(rect.width - 95, e.clientX - rect.left));
            const y = Math.max(40, Math.min(rect.height - 40, e.clientY - rect.top));
            mouseX.set(x);
            mouseY.set(y);
            setIsHovered(true);
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover transition duration-300 ease-out group-hover:brightness-[0.65]"
            loading="lazy"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          />

          {/* Dynamic hover social overlay following cursor position */}
          {hasSocialLinks && (
            <motion.div
              className="pointer-events-none absolute top-0 left-0 z-20"
              style={{
                x: springX,
                y: springY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.6,
                pointerEvents: isHovered ? "auto" : "none"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-5 rounded-full bg-slate-900/85 px-5 py-3 backdrop-blur-md shadow-2xl border border-slate-700/60">
                {member.instagram && (
                  <motion.a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-pink-400 hover:text-pink-300 text-3xl"
                    whileHover={{ scale: 1.25, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaInstagram size={32} />
                  </motion.a>
                )}
                {member.linkedin && (
                  <motion.a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-sky-400 hover:text-sky-300 text-3xl"
                    whileHover={{ scale: 1.25, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaLinkedin size={32} />
                  </motion.a>
                )}
                {member.email && (
                  <motion.a
                    href={`mailto:${member.email}`}
                    aria-label="Email"
                    className="text-emerald-300 hover:text-emerald-200 text-3xl"
                    whileHover={{ scale: 1.25, rotate: 3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEnvelope size={32} />
                  </motion.a>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center">
            <motion.h3
              className="text-xl font-semibold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {member.name}
            </motion.h3>
            <motion.p
              className="mt-1 inline-block rounded-full bg-slate-700/60 px-3 py-1 text-sm font-medium text-slate-200"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 85, 105, 0.8)" }}
              transition={{ duration: 0.2 }}
            >
              {member.position}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
