'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Instagram } from "lucide-react";

type ProfileCardProps = {
  name: string;
  title: string;
  avatarUrl: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  instagramUrl?: string;
  linkedinUrl?: string;
  email?: string;
};

// Compute tilt on client only to avoid SSR/CSR markup mismatch

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  title,
  avatarUrl,
  enableTilt = true,
  enableMobileTilt = false,
  instagramUrl,
  linkedinUrl,
  email,
}) => {
  const [tiltClass, setTiltClass] = useState("");

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0.8 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.8,
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
      }
    },
    hover: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
      }
    }
  };

  useEffect(() => {
    if (!enableTilt) return;
    const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const allowTilt = isMobile ? !!enableMobileTilt : true;
    if (allowTilt) {
      setTiltClass("[transform:perspective(1000px)] hover:[transform:perspective(1000px)_rotateX(4deg)_rotateY(-4deg)]");
    }
  }, [enableTilt, enableMobileTilt]);

  return (
    <motion.div 
      className={`group relative w-full max-w-[420px] mx-auto rounded-2xl border border-slate-800/60 bg-slate-800/50 backdrop-blur-sm shadow-xl transition-transform duration-300 ${tiltClass}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-700/20 to-slate-900/40 pointer-events-none" />
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative w-full h-[350px] sm:h-[400px] overflow-hidden">
          <motion.img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          />
          {/* Hover social overlay */}
          <motion.div 
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <motion.div 
              className="pointer-events-auto flex items-center gap-4 rounded-full bg-slate-900/70 px-4 py-2 backdrop-blur-md shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {instagramUrl && (
                <motion.a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(219,39,119,0.5)]"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram size={20} stroke="url(#ig-grad)" className="drop-shadow-[0_0_4px_rgba(219,39,119,0.6)]" />
                </motion.a>
              )}
              {linkedinUrl && (
                <motion.a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaLinkedinIn size={20} className="text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                </motion.a>
              )}
              {email && (
                <motion.a
                  href={`mailto:${email}`}
                  aria-label="Email"
                  className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.5)]"
                  whileHover={{ scale: 1.2, rotate: 3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SiGmail size={20} fill="url(#gmail-smooth-grad)" className="drop-shadow-[0_0_4px_rgba(255,107,107,0.4)]" />
                </motion.a>
              )}
            </motion.div>
          </motion.div>
        </div>
        <motion.div 
          className="p-6"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center">
            <motion.h3 
              className="text-xl font-semibold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {name}
            </motion.h3>
            <motion.p 
              className="mt-1 inline-block rounded-full bg-slate-700/60 px-3 py-1 text-sm font-medium text-slate-200"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 85, 105, 0.8)" }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;


