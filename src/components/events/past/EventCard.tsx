"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PastEvent {
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

interface EventCardProps {
  event: PastEvent;
  onClick: (event: PastEvent) => void;
  className?: string;
  isFeatured?: boolean;
}

export function EventCard({ event, onClick, className, isFeatured }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  const thumbnail =
    event.gallery && event.gallery.length > 0 && event.gallery[0]
      ? event.gallery[0].trim()
      : "/assests/image.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("group cursor-pointer h-full", className)}
      onClick={() => onClick(event)}
    >
      <div className="h-full flex flex-col justify-between rounded-3xl overflow-hidden relative bg-gradient-to-br from-purple-900/30 via-violet-950/40 to-fuchsia-950/30 backdrop-blur-md border border-purple-500/25 transition-all duration-300 group-hover:border-purple-400/60 group-hover:shadow-[0_10px_30px_rgba(147,51,234,0.25)]">
        {/* Glow ambient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Thumbnail Artwork Container */}
        <div className={cn("relative w-full overflow-hidden shrink-0", isFeatured ? "h-52 sm:h-64" : "h-44 sm:h-48")}>
          <Image
            src={thumbnail}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={thumbnail.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12071f] via-transparent to-black/30 pointer-events-none" />

          {/* Badges on top */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <Badge
              variant="secondary"
              className="bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-heading uppercase tracking-wider border border-purple-400/30 px-2.5 py-0.5"
            >
              Past Event
            </Badge>

            <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white/80 flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-200" />
            </span>
          </div>
        </div>

        {/* Condensed Info Body */}
        <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
          <div>
            {/* Date Tag */}
            <div className="flex items-center gap-1.5 text-xs text-purple-300/80 font-body mb-2">
              <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>

            {/* Event Title */}
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>

            {/* Subtle teaser description */}
            <p className="text-xs text-purple-200/70 font-body line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Bottom interactive action */}
          <div className="pt-4 mt-3 border-t border-purple-500/15 flex items-center justify-between">
            <span className="text-[11px] text-purple-300/60 font-body">
              {event.venue}
            </span>
            <span className="text-xs font-heading font-medium text-pink-400 group-hover:text-pink-300 transition-colors inline-flex items-center gap-0.5">
              Details →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
