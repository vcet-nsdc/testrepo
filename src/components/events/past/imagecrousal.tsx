"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  eventTitle: string;
  isVisible?: boolean;
}

export function ImageCarousel({ images, eventTitle, isVisible = true }: ImageCarouselProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Keyboard navigation for full-screen zoom modal
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev - 1 + images.length) % images.length : 0
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev + 1) % images.length : 0
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="relative h-44 rounded-2xl overflow-hidden bg-purple-950/20 border border-purple-500/20 flex items-center justify-center">
        <p className="text-purple-300/60 text-xs font-mono">No archive media available</p>
      </div>
    );
  }

  const isVideo = (url: string) => {
    return url.includes('.mov') || url.includes('.mp4') || url.includes('.webm') || url.includes('.avi');
  };

  // If there are at least 2 photos, render the continuous auto-moving photo strip
  const hasMultiplePhotos = images.length >= 2;
  const repeatCount = images.length < 5 ? 4 : 2;
  const displayImages = hasMultiplePhotos ? Array(repeatCount).fill(images).flat() : images;
  const speedSeconds = Math.max(images.length * 3.5, 25);

  return (
    <>
      {hasMultiplePhotos ? (
        /* Continuous Auto-moving Photo Strip */
        <div className="photo-strip-container relative w-full overflow-hidden py-1">
          <div className="photo-strip-mask w-full">
            <div
              className="photo-strip-track flex gap-4 w-max"
              style={{ '--marquee-duration': `${speedSeconds}s` } as React.CSSProperties}
            >
              {displayImages.map((imgUrl, index) => {
                const originalIndex = index % images.length;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(originalIndex)}
                    className="relative flex-shrink-0 w-52 h-36 sm:w-64 sm:h-44 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-purple-950/40 cursor-pointer group transition-transform duration-300 hover:scale-[1.03]"
                  >
                    {isVideo(imgUrl) ? (
                      <video
                        src={imgUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={imgUrl}
                        alt={`${eventTitle} photo ${originalIndex + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 210px, 260px"
                        unoptimized
                      />
                    )}
                    {/* Hover Zoom overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between items-center px-1 pt-2">
            <span className="text-[11px] text-purple-300/70 font-body">
              ← Hover to pause • Click to zoom photo
            </span>
            <span className="text-[11px] text-purple-300/70 font-body">
              {images.length} Photos
            </span>
          </div>
        </div>
      ) : (
        /* Standard Static Grid for 1 or 2 Photos */
        <div className={`grid ${images.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
          {images.map((imgUrl, index) => (
            <div
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-purple-950/40 cursor-pointer group"
            >
              {isVideo(imgUrl) ? (
                <video
                  src={imgUrl}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                />
              ) : (
                <Image
                  src={imgUrl}
                  alt={`${eventTitle} photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="400px"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <ZoomIn className="w-7 h-7 text-white drop-shadow-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Zoom Lightbox Modal via Portal */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedImageIndex !== null && isVisible && (
            <motion.div
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImageIndex(null)}
            >
              <motion.div
                className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center my-auto"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute -top-12 sm:-top-14 right-0 p-2.5 text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 border border-purple-500/30 rounded-full transition-all duration-200 z-30 focus:outline-none hover:scale-105"
                  aria-label="Close photo preview"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* High-res Photo Container */}
                <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/80 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)] group">
                  {isVideo(images[selectedImageIndex] || "") ? (
                    <video
                      src={images[selectedImageIndex] || ""}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      loop
                    />
                  ) : (
                    <Image
                      src={images[selectedImageIndex] || ""}
                      alt={`${eventTitle} photo ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      priority
                      unoptimized
                    />
                  )}

                  {/* Floating Left/Right Chevrons on Image */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) =>
                            prev !== null ? (prev - 1 + images.length) % images.length : 0
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-purple-400/30 transition-all hover:scale-110 shadow-lg"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) =>
                            prev !== null ? (prev + 1) % images.length : 0
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-purple-400/30 transition-all hover:scale-110 shadow-lg"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Lightbox Footer & Status */}
                <div className="flex items-center justify-between w-full mt-4 px-2">
                  <span className="text-xs text-purple-300 font-mono">
                    {eventTitle}
                  </span>

                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-200">
                    Photo {selectedImageIndex + 1} of {images.length}
                  </span>

                  <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
                    Use ← / → keys or Esc to close
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
