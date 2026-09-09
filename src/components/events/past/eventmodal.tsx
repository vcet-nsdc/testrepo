"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Calendar, MapPin, Clock } from "lucide-react";
import { ImageCarousel } from "./imagecrousal";
import { createPortal } from "react-dom";

export interface Event {
  id: string;
  title: string;
  year: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  about: string;
  highlights: string[];
  gallery: string[];
  link: string;
}

interface EventModalProps {
  event: Event | null;
  onClose: () => void;
  stockImages: string[];
}

export function EventModal({ event, onClose, stockImages }: EventModalProps) {
  useEffect(() => {
    if (!event) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const imagesToShow = event.gallery && event.gallery.length > 0 ? event.gallery : stockImages;

  return typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl flex flex-col"
              style={{ backgroundColor: "rgba(22, 10, 36, 0.95)", backdropFilter: "blur(16px)" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-6 text-fuchsia-200 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 border border-white/10 transition-all duration-200 z-30 focus:outline-none"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8 text-left overflow-y-auto modal-smooth-scroll flex-1 space-y-6">
                {/* Header Title */}
                <div>
                  <span className="text-xs font-heading uppercase tracking-wider text-pink-400 font-semibold mb-1 block">
                    {event.year} Event Archive
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                    {event.title}
                  </h3>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-purple-200">
                    <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Clock className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Event Photo Strip / Media Gallery */}
                <div className="py-2">
                  <ImageCarousel images={imagesToShow} eventTitle={event.title} isVisible={!!event} />
                </div>

                {/* Overview & About */}
                <div className="space-y-3">
                  <h4 className="text-fuchsia-300 text-xs font-body uppercase tracking-wider font-semibold">
                    Overview & Description
                  </h4>
                  <div className="space-y-2 text-fuchsia-100 text-sm leading-relaxed font-body">
                    <p>{event.description}</p>
                    {event.about && event.about !== event.description && <p>{event.about}</p>}
                  </div>
                </div>

                {/* Highlights & Awards */}
                {event.highlights && event.highlights.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-6 pt-2">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <h4 className="text-fuchsia-300 text-xs font-body uppercase tracking-wider font-semibold mb-3">
                        Highlights
                      </h4>
                      <ul className="space-y-2 text-xs md:text-sm text-fuchsia-100 font-body">
                        {event.highlights.slice(0, Math.ceil(event.highlights.length / 2)).map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <h4 className="text-fuchsia-300 text-xs font-body uppercase tracking-wider font-semibold mb-3">
                        Key Takeaways & Recognition
                      </h4>
                      <ul className="space-y-2 text-xs md:text-sm text-fuchsia-100 font-body">
                        {event.highlights.slice(Math.ceil(event.highlights.length / 2)).map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Footer action link */}
                {event.link && event.link !== "#" && (
                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-liquid-purple text-xs !py-2 !px-5"
                    >
                      <span>Explore Event Page</span>
                      <ExternalLink className="w-3.5 h-3.5 no-shift" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;
}
