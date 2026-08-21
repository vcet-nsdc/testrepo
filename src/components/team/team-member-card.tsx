/**
 * Team Member Card Component
 * Individual team member card with social links
 */

'use client';

import { motion } from 'framer-motion';
import { FaLinkedinIn } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { Instagram } from 'lucide-react';
import type { TeamMember } from '@/types';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
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
        <div className="relative w-full h-[350px] sm:h-[400px] overflow-hidden">
          <motion.img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover transition duration-300 ease-out group-hover:brightness-[0.55]"
            loading="lazy"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          />
          
          {/* Hover social overlay */}
          <motion.div 
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
          >
            <motion.div 
              className="pointer-events-auto flex items-center gap-5 rounded-full bg-slate-900/70 px-5 py-3 backdrop-blur-md shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {member.instagram && (
                <motion.a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(219,39,119,0.5)]"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram size={24} stroke="url(#ig-grad)" className="drop-shadow-[0_0_4px_rgba(219,39,119,0.6)]" />
                </motion.a>
              )}
              {member.linkedin && (
                <motion.a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaLinkedinIn size={24} className="text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                </motion.a>
              )}
              {member.email && (
                <motion.a
                  href={`mailto:${member.email}`}
                  aria-label="Email"
                  className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.5)]"
                  whileHover={{ scale: 1.2, rotate: 3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SiGmail size={24} fill="url(#gmail-smooth-grad)" className="drop-shadow-[0_0_4px_rgba(255,107,107,0.4)]" />
                </motion.a>
              )}
            </motion.div>
          </motion.div>
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
