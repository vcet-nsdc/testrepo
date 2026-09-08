"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ImageAutoSliderProps {
  images?: string[];
  className?: string;
  speedSeconds?: number;
}

export const ImageAutoSlider: React.FC<ImageAutoSliderProps> = ({
  images: customImages,
  className,
  speedSeconds = 25,
}) => {
  // Default Unsplash stock image URLs
  const defaultImages = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
  ];

  const images = customImages && customImages.length > 0 ? customImages : defaultImages;

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className={cn("relative overflow-hidden w-full group", className)}>
      <div className="scroll-mask-container w-full py-2">
        <div
          className="infinite-scroll-track flex gap-4 w-max"
          style={{ '--slider-duration': `${speedSeconds}s` } as React.CSSProperties}
        >
          {duplicatedImages.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 h-36 sm:w-64 sm:h-44 md:w-72 md:h-48 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-slate-900/60 transition-transform duration-300 hover:scale-105"
            >
              <img
                src={image}
                alt={`Event image ${(index % images.length) + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Component = ImageAutoSlider;
