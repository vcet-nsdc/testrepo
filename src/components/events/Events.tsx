"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, useSpring, useMotionValue, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { ImageCarousel } from "@/components/events/past/imagecrousal";
import { 
  Calendar, 
  Clock,
  MapPin, 
  Sparkles, 
  ExternalLink, 
  Trophy, 
  ArrowUp, 
  Layers, 
  ChevronDown,
  ArrowRight,
  X
} from "lucide-react";

// Perlin/Hermite 5th-order smootherstep for zero-jerk, buttery acceleration/deceleration
function smootherstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// Complete dataset preserving 100% of website details, media, and copy
interface PastEventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  venue: string;
  src: string;
  about: string;
  highlights: string[];
  link?: string;
  gallery?: string[];
}

interface TimelineCheckpoint {
  year: string;
  tagline: string;
  events: PastEventItem[];
}

const TIMELINE_DATA: TimelineCheckpoint[] = [
  {
    year: "2026 – 2027",
    tagline: "FLAGSHIP MILESTONES",
    events: [
      {
        id: "event_byteverse_2026",
        title: "Byteverse 2026 Arena",
        description: "Flagship Manga Hackathon • 2026",
        date: "March 2026",
        time: "10:00 AM – 6:00 PM",
        venue: "VCET, Vasai",
        src: "/assests/byteverse.jpeg",
        about:
          "Byteverse 2026 is VCET NSDC's premier manga-themed arena where students assemble squads to engineer high-impact software, solve computational puzzles, and compete for top honors.",
        highlights: [
          "Interactive technical arena across systems, Web3, and applied AI.",
          "Manga-styled team battles with dynamic live leaderboard progression.",
          "Direct mentorship, domain excellence trophies, and cash prizes."
        ],
        gallery: [
          "/assests/byteverse.jpeg",
          "/assests/byteverse_logo_v2.png",
          "/assests/itech.png",
          "/assests/techblitz.jpeg"
        ],
        link: "https://byteverse-2026.vercel.app"
      }
    ]
  },
  {
    year: "2025 – 2026",
    tagline: "INNOVATION SPRINT",
    events: [
      {
        id: "event_techblitz_2026",
        title: "Techblitz 2026",
        description: "Manga-Themed Hackathon • March 2026",
        date: "March 13, 2026",
        time: "10:00 AM",
        venue: "VCET, Vasai",
        src: "/assests/techblitz.jpeg",
        about:
          "TechBlitz 2026 brings students together to solve high-impact software challenges, explore emerging tech architectures, and compete for top rewards.",
        highlights: [
          "Multi-track algorithmic and system engineering challenges.",
          "Hands-on mentorship from senior developers and faculty.",
          "Domain excellence awards and certificates for all squads."
        ],
        gallery: [
          "/assests/techblitz.jpeg",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_6.webp?updatedAt=1758099877404",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_7.webp?updatedAt=1758099876888",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_9.webp?updatedAt=1758099876544",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_5.webp?updatedAt=1758099874879"
        ],
        link: "#"
      },
      {
        id: "event_000",
        title: "Code-o-Fiesta 2025",
        description: "Software Innovation Sprint • Sept 2025",
        date: "September 13, 2025",
        time: "9:30 AM – 5:00 PM",
        venue: "VCET, Vasai",
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        about:
          "Code-o-Fiesta is a dynamic sprint where teams develop end-to-end software solutions for real-world problems and pitch their prototypes to expert judges.",
        highlights: [
          "Pre-event real-world problem statements for prototype build.",
          "Live product presentation and functionality assessment round.",
          "Jury evaluations focusing on novelty, execution, and utility."
        ],
        gallery: [
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
          "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista4.webp?updatedAt=1758099886744",
          "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista3.webp?updatedAt=1758099885719",
          "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista2.webp?updatedAt=1758099884816"
        ],
        link: "https://vcet-nsdc.vercel.app/code-o-fiesta"
      }
    ]
  },
  {
    year: "2024 – 2025",
    tagline: "AUTONOMOUS FRONTIER",
    events: [
      {
        id: "event_001",
        title: "Techblitz 2025",
        description: "Techtrivia Challenge • Feb 2025",
        date: "February 25, 2025",
        time: "10:00 AM – 1:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_6.webp?updatedAt=1758099877404",
        about:
          "An intense technical trivia sprint testing core foundations across programming languages, data structures, cloud architectures, and emerging technologies.",
        highlights: [
          "Comprehensive technical trivia spanning software, AI, and systems.",
          "Individual and team battles with real-time digital leaderboards.",
          "Prizes for top squads and participation credentials for all."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_6.webp?updatedAt=1758099877404",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_7.webp?updatedAt=1758099876888",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_9.webp?updatedAt=1758099876544",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_5.webp?updatedAt=1758099874879"
        ],
        link: "https://techblitz2025.netlify.app/"
      },
      {
        id: "event_002",
        title: "TechX 2024",
        description: "Technical Showcase • March 2025",
        date: "March 14, 2025",
        time: "2:00 PM – 5:00 PM",
        venue: "Labs 114 & 115, VCET, Vasai",
        src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
        about:
          "A flagship product expo connecting student innovators with industry leaders, showcasing projects in autonomous drones, blockchain inventory, and GPU workstations.",
        highlights: [
          "Showcase featuring DJI drones, RTX workstations, and Web3 tools.",
          "Industry evaluations from Edba Academy, Tech Cryptors, and DataMango.",
          "Direct mentorship on production scalability and market readiness."
        ],
        gallery: [
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
          "https://ik.imagekit.io/nsdc2025vcet/events/products24/128.webp?updatedAt=1758099867393",
          "https://ik.imagekit.io/nsdc2025vcet/events/products24/127.webp?updatedAt=1758099867004",
          "https://ik.imagekit.io/nsdc2025vcet/events/products24/126.webp?updatedAt=1758099866829"
        ],
        link: "https://vcet-nsdc.vercel.app/productshowcase24"
      },
      {
        id: "event_003",
        title: "Code o Fiesta 2024",
        description: "Domain Coding Battle • Sept 2024",
        date: "September 20, 2024",
        time: "11:00 AM – 3:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista4.webp?updatedAt=1758099886744",
        about:
          "Organized by AI & Data Science departments, this premier coding battle challenged participants to develop algorithmic and software solutions for Healthcare and Agriculture.",
        highlights: [
          "Domain-specific problem statements in Healthcare and Agri-tech.",
          "Live code execution and presentation round before senior faculty.",
          "Recognition and awards for top algorithmic problem solvers."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista4.webp?updatedAt=1758099886744",
          "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista3.webp?updatedAt=1758099885719",
          "https://ik.imagekit.io/nsdc2025vcet/events/codeOfista/codeofista2.webp?updatedAt=1758099884816"
        ],
        link: "https://vcet-nsdc.vercel.app/Codeofiesta"
      },
      {
        id: "event_004",
        title: "Logo Making Competition",
        description: "ICE3T Design Challenge • Sept 2024",
        date: "September 03, 2024",
        time: "9:30 AM – 12:30 PM",
        venue: "VCET, Vasai",
        src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
        about:
          "A creative design sprint for the ICE3T conference, challenging participants to craft visual emblems representing Data Science, Cloud Computing, and Indigenous Knowledge Systems.",
        highlights: [
          "3-hour design sprint for ideation, sketching, and digital refining.",
          "Themes covering Data Science, Cloud Systems, and IoT architecture.",
          "Judging based on conceptual creativity, relevance, and visual identity."
        ],
        gallery: [
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
          "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc1.webp?updatedAt=1758099851354",
          "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc5.webp?updatedAt=1758099851329",
          "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc8.webp?updatedAt=1758099851287"
        ],
        link: "https://vcet-nsdc.vercel.app/logo"
      },
      {
        id: "event_005",
        title: "Seminar on NVIDIA Jetson AI",
        description: "Edge Computing & DeepStream • Aug 2024",
        date: "August 30, 2024",
        time: "10:00 AM – 12:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/nvidia/nvidia_7.webp?updatedAt=1758099902097",
        about:
          "In association with IETE, speaker Mr. Anil Sarode demonstrated edge model acceleration using NVIDIA Jetson hardware, DeepStream pipelines, and Generative AI at the edge.",
        highlights: [
          "Hands-on demonstration of Jetson hardware acceleration.",
          "Real-time video analytics and model deployment walkthroughs.",
          "Industrial robotics and autonomous vision use cases."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/nvidia/nvidia_7.webp?updatedAt=1758099902097",
          "https://ik.imagekit.io/nsdc2025vcet/events/nvidia/nvidia_4.webp?updatedAt=1758099902019",
          "https://ik.imagekit.io/nsdc2025vcet/events/nvidia/nvidia_6.webp?updatedAt=1758099901824"
        ],
        link: "https://techblitz2025.netlify.app/"
      },
      {
        id: "event_006",
        title: "National Project Showcase [VNPS]",
        description: "National Level Expo • April 2024",
        date: "April 12, 2024",
        time: "10:00 AM – 1:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/products24/128.webp?updatedAt=1758099867393",
        about:
          "A national platform hosting student teams across India to present breakthrough projects in computer vision, diagnostic AI, robotics, and energy optimization.",
        highlights: [
          "Multi-track national expo focused on AI, ML, NLP, and Robotics.",
          "Rigorous evaluations by senior industry researchers and judges.",
          "Live demonstrations in UAV navigation and predictive healthcare."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/products24/128.webp?updatedAt=1758099867393",
          "https://ik.imagekit.io/nsdc2025vcet/events/products24/127.webp?updatedAt=1758099867004",
          "https://ik.imagekit.io/nsdc2025vcet/events/products24/126.webp?updatedAt=1758099866829"
        ],
        link: "https://vcet-nsdc.vercel.app/nvidia"
      }
    ]
  },
  {
    year: "2023 – 2024",
    tagline: "THE FOUNDATIONAL ODYSSEY",
    events: [
      {
        id: "event_007",
        title: "Oscillations 2024",
        description: "National Paper Presentation • April 2024",
        date: "April 05, 2024",
        time: "10:00 AM – 12:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc1.webp?updatedAt=1758099851354",
        about:
          "Organized with IETE Mumbai, this national paper presentation symposium brought forward cutting-edge research in AI, IoT, cloud computing, and mechanical systems.",
        highlights: [
          "6 technical presentation tracks with peer-reviewed evaluations.",
          "Integration of Indigenous Knowledge Systems with modern engineering.",
          "Awards for high-impact technical novelty and publications."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc1.webp?updatedAt=1758099851354",
          "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc5.webp?updatedAt=1758099851329",
          "https://ik.imagekit.io/nsdc2025vcet/events/oscillation/osc8.webp?updatedAt=1758099851287"
        ],
        link: "https://vcet-nsdc.vercel.app/vnps"
      },
      {
        id: "event_008",
        title: "Techblitz 2024",
        description: "Speed Coding Sprint • March 2024",
        date: "March 15, 2024",
        time: "10:00 AM – 5:00 PM",
        venue: "VCET, Vasai",
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        about:
          "A high-speed coding tournament challenging developers to harness AI copilots across AI web engineering, UI/UX interaction design, and machine learning models.",
        highlights: [
          "Format encouraging real-world AI tool integration and speed.",
          "Three competitive tracks spanning web apps, UI/UX, and ML.",
          "Speed benchmarks and live jury evaluations."
        ],
        gallery: [
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_6.webp?updatedAt=1758099877404",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_7.webp?updatedAt=1758099876888",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechBlitz/TechBlitz_img_5.webp?updatedAt=1758099874879"
        ],
        link: "https://vcet-nsdc.vercel.app/oscillation"
      },
      {
        id: "event_009",
        title: "Expert Lecture on Power BI",
        description: "Business Analytics • April 2023",
        date: "April 10, 2023",
        time: "10:00 AM – 12:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/PowerBI/powerbi_img_5.webp?updatedAt=1758099857412",
        about:
          "Hands-on workshop introducing students to Microsoft Power BI, interactive dashboard architecture, DAX formulas, and business intelligence pipelines.",
        highlights: [
          "Live interactive dashboard building from raw unstructured datasets.",
          "Practical data storytelling and business KPI visualization.",
          "Career guidance for business intelligence and analytics roles."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/PowerBI/powerbi_img_5.webp?updatedAt=1758099857412",
          "https://ik.imagekit.io/nsdc2025vcet/events/PowerBI/powerbi_img_4.webp?updatedAt=1758099857205",
          "https://ik.imagekit.io/nsdc2025vcet/events/PowerBI/powerbi_img_2.webp?updatedAt=1758099856856"
        ],
        link: "#"
      },
      {
        id: "event_010",
        title: "TechX 2023",
        description: "Inaugural Product Showcase • April 2023",
        date: "April 14, 2023",
        time: "10:00 AM – 5:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/products/product_9.webp?updatedAt=1758099862435",
        about:
          "The inaugural product exhibition of VCET NSDC, showcasing early student-built prototypes in AI parking allocation, content systems, and cognitive audio engines.",
        highlights: [
          "Inaugural product exhibition inaugurated by Chief Guest Akshay Bharambe.",
          "Student exhibits: Parking Pal AI, Solomon CMS, and Binaural Beats.",
          "Demonstrations bridging academic concepts with working products."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/products/product_9.webp?updatedAt=1758099862435",
          "https://ik.imagekit.io/nsdc2025vcet/events/products/product_7.webp?updatedAt=1758099862354",
          "https://ik.imagekit.io/nsdc2025vcet/events/products/product_8.webp?updatedAt=1758099862325",
          "https://ik.imagekit.io/nsdc2025vcet/events/products/product_6.webp?updatedAt=1758099862034",
          "https://ik.imagekit.io/nsdc2025vcet/events/products/product_5.webp?updatedAt=1758099861035",
          "https://ik.imagekit.io/nsdc2025vcet/events/products/product_4.webp?updatedAt=1758099859991"
        ],
        link: "https://vcet-nsdc.vercel.app/powerbi"
      },
      {
        id: "event_011",
        title: "VCET TechZette Launch",
        description: "Digital Hub Publication • April 2023",
        date: "April 17, 2023",
        time: "9:30 AM – 1:30 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/TechZette/TechZette_5.webp?updatedAt=1758099878375",
        about:
          "Official launch of techz.vcet.edu.in – विसीईटी ज्ञानपत्र, a specialized technical blog for students and faculty to publish research in data science and engineering.",
        highlights: [
          "Launch of VCET's dedicated technical research publication portal.",
          "Platform for students and faculty to share articles on AI and computing.",
          "Inauguration presided over by Chief Guest Mr. Rahul Mhatre."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/TechZette/TechZette_5.webp?updatedAt=1758099878375",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechZette/TechZette_2.webp?updatedAt=1758099878308",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechZette/TechZette_3.webp?updatedAt=1758099877592",
          "https://ik.imagekit.io/nsdc2025vcet/events/TechZette/TechZette_4.webp?updatedAt=1758099877287"
        ],
        link: "https://vcet-nsdc.vercel.app/product"
      },
      {
        id: "event_012",
        title: "NSDC Chapter Inauguration",
        description: "Foundational Ceremony • April 2023",
        date: "April 20, 2023",
        time: "10:00 AM – 12:00 PM",
        venue: "VCET, Vasai",
        src: "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_9.webp?updatedAt=1758099890901",
        about:
          "The historic founding ceremony establishing the VCET NSDC Student Chapter under the Department of AI & Data Science, setting the milestone where all events began.",
        highlights: [
          "Official chapter charter and logo unveiling ceremony.",
          "Distinguished keynote addresses on data science for societal impact.",
          "Inauguration marking the official inception of VCET NSDC."
        ],
        gallery: [
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_9.webp?updatedAt=1758099890901",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_8.webp?updatedAt=1758099890514",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_7.webp?updatedAt=1758099890235",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_6.webp?updatedAt=1758099889333",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_5.webp?updatedAt=1758099889134",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_4.webp?updatedAt=1758099887890",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_3.webp?updatedAt=1758099887645",
          "https://ik.imagekit.io/nsdc2025vcet/events/inaugration/inaug_2.webp?updatedAt=1758099887269"
        ],
        link: "https://vcet-nsdc.vercel.app/techzette"
      }
    ]
  }
];

function TimelineCheckpointRow({
  checkpoint,
  idx,
  dotRef,
  isCurrentActive,
  isCompleted,
}: {
  checkpoint: TimelineCheckpoint;
  idx: number;
  dotRef?: React.Ref<HTMLDivElement> | undefined;
  isCurrentActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div key={idx} className="relative flex flex-col md:flex-row gap-8 lg:gap-12">
      {/* Glowing Checkpoint Node & Left Sticky Year */}
      <div className="md:w-[240px] lg:w-[280px] shrink-0 flex items-start gap-4">
        <div
          ref={dotRef}
          className={`relative z-20 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 shrink-0 ${
            isCurrentActive
              ? "bg-purple-950/90 backdrop-blur-md border-2 border-purple-300 shadow-[0_0_30px_rgba(168,85,247,1),0_0_60px_rgba(168,85,247,0.5)] scale-110"
              : isCompleted
              ? "bg-purple-950/70 backdrop-blur-md border-2 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-100"
              : "bg-black/70 backdrop-blur-md border-2 border-white/20 shadow-none scale-95"
          }`}
        >
          {/* Active beacon sonar ping ripple */}
          {isCurrentActive && (
            <span className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-60 pointer-events-none" />
          )}

          <div
            className={`rounded-full transition-all duration-500 ${
              isCurrentActive
                ? "w-4 h-4 bg-white shadow-[0_0_12px_#ffffff,0_0_20px_#c084fc] animate-pulse"
                : isCompleted
                ? "w-3 h-3 bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]"
                : "w-2.5 h-2.5 bg-zinc-600"
            }`}
          />
        </div>
        <div className="sticky top-28">
          <span
            className={`font-mono text-xs uppercase tracking-widest font-bold transition-all duration-500 ${
              isCurrentActive
                ? "text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                : isCompleted
                ? "text-purple-400/80"
                : "text-zinc-600"
            }`}
          >
            {checkpoint.tagline}
          </span>
          <h3
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading mt-1 transition-all duration-500 whitespace-nowrap ${
              isCurrentActive
                ? "text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                : isCompleted
                ? "text-zinc-200"
                : "text-zinc-600"
            }`}
          >
            {checkpoint.year}
          </h3>
          <p
            className={`text-xs font-mono mt-1 transition-colors duration-500 ${
              isCurrentActive
                ? "text-purple-200 font-medium"
                : isCompleted
                ? "text-purple-300/60"
                : "text-zinc-600"
            }`}
          >
            {checkpoint.events.length} Milestones
          </p>
        </div>
      </div>

      {/* Right Side Cards Grid */}
      <div className="md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 pl-14 md:pl-0">
        {checkpoint.events.map((evt) => (
          <ExpandableCard
            key={evt.id}
            title={evt.title}
            description={evt.description}
            src={evt.src}
            date={evt.date}
            time={evt.time}
            venue={evt.venue}
            footer={
              evt.link && evt.link !== "#" ? (
                <a
                  href={evt.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-purple-400 hover:text-purple-300 transition text-[11px] font-mono flex items-center gap-1"
                >
                  <span>Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null
            }
          >
            {/* Expanded modal content */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-300 border-b border-purple-900/30 pb-3">
                <span className="flex items-center gap-1.5 bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-500/20">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  {evt.date}
                </span>
                {evt.time && (
                  <span className="bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-500/20">
                    {evt.time}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-500/20">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  {evt.venue}
                </span>
              </div>

              {/* Concise Overview */}
              <div>
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-1.5">
                  Executive Overview
                </h5>
                <p className="text-zinc-200 text-sm leading-relaxed font-sans">
                  {evt.about}
                </p>
              </div>

              {/* Key Highlights */}
              {evt.highlights && evt.highlights.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-2">
                    Key Highlights
                  </h5>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {evt.highlights.map((hl, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Photo Archive with Gliding Effect & Pause on Hover */}
              {evt.gallery && evt.gallery.length > 0 && (
                <div className="mt-5 pt-3 border-t border-purple-900/30">
                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Photo Archive ({evt.gallery.length})
                    </span>
                  </h5>
                  <ImageCarousel images={evt.gallery} eventTitle={evt.title} />
                </div>
              )}

              {evt.link && evt.link !== "#" && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={evt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 px-4 py-2 rounded-lg border border-purple-500/40 transition shadow-sm hover:scale-105"
                  >
                    <span>Official Link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  </a>
                </div>
              )}
            </div>
          </ExpandableCard>
        ))}
      </div>
    </div>
  );
}

export default function Events() {
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const dotRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = React.useRef<HTMLDivElement>(null);

  const [activeCheckpoint, setActiveCheckpoint] = React.useState<number>(0);
  const [isAtEnd, setIsAtEnd] = React.useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState<boolean>(false);

  // Scroll parallax for ongoing event logo
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const logoY = useTransform(heroScrollProgress, [0, 1], [0, 45]);
  const logoScale = useTransform(heroScrollProgress, [0, 1], [1, 0.94]);
  const logoOpacity = useTransform(heroScrollProgress, [0, 0.85], [1, 0.45]);

  // 3D perspective interactive tilt for the 3D logo (cached rect + tuned springs for 120fps zero-lag motion)
  const logoMouseX = useMotionValue(0);
  const logoMouseY = useMotionValue(0);
  const logoSpringX = useSpring(logoMouseX, { stiffness: 300, damping: 26, mass: 0.15 });
  const logoSpringY = useSpring(logoMouseY, { stiffness: 300, damping: 26, mass: 0.15 });
  const logoRotateX = useTransform(logoSpringY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const logoRotateY = useTransform(logoSpringX, [-0.5, 0.5], ["-16deg", "16deg"]);
  const logoRectRef = React.useRef<DOMRect | null>(null);

  const handleLogoMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    logoRectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = logoRectRef.current || e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    logoMouseX.set(xPct);
    logoMouseY.set(yPct);
  };

  const handleLogoMouseLeave = () => {
    logoRectRef.current = null;
    logoMouseX.set(0);
    logoMouseY.set(0);
  };

  // Robust background scroll lock when detail modal is open
  React.useEffect(() => {
    if (!isDetailModalOpen) return;

    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDetailModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isDetailModalOpen]);

  const beamTarget = useMotionValue(0);
  const smoothBeamHeight = useSpring(beamTarget, {
    stiffness: 160,
    damping: 24,
    mass: 0.18,
    restDelta: 0.5,
  });

  React.useEffect(() => {
    const updateTimeline = () => {
      if (!timelineRef.current) return;
      const containerRect = timelineRef.current.getBoundingClientRect();
      const triggerY = window.innerHeight * 0.55;

      const dots = dotRefs.current
        .slice(0, TIMELINE_DATA.length)
        .map((el) => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            screenY: rect.top + rect.height / 2,
            relativeY: rect.top - containerRect.top + rect.height / 2,
          };
        });

      if (dots.some((d) => d === null) || dots.length === 0) return;
      const validDots = dots as { screenY: number; relativeY: number }[];
      const N = validDots.length;

      const dFirst = validDots[0];
      if (!dFirst) return;

      const approachDistance = 260;
      let currentActive = 0;
      let targetHeight = dFirst.relativeY;

      if (dFirst.screenY > triggerY) {
        // Approaching checkpoint 0 from above
        const diff = dFirst.screenY - triggerY;
        if (diff < approachDistance) {
          const t = smootherstep(approachDistance, 0, diff);
          targetHeight = t * dFirst.relativeY;
          currentActive = 0;
        } else {
          targetHeight = 0;
          currentActive = -1;
        }
      } else {
        // Check between consecutive checkpoints
        let inSegment = false;
        for (let i = 0; i < N - 1; i++) {
          const dCurr = validDots[i];
          const dNext = validDots[i + 1];
          if (!dCurr || !dNext) continue;

          if (dCurr.screenY <= triggerY && dNext.screenY > triggerY) {
            inSegment = true;
            const segmentDist = dNext.relativeY - dCurr.relativeY;
            const scrolledPast = triggerY - dCurr.screenY;
            const dwell = Math.min(180, segmentDist * 0.26);

            if (scrolledPast <= dwell) {
              targetHeight = dCurr.relativeY;
              currentActive = i;
            } else {
              const t = smootherstep(dwell, segmentDist, scrolledPast);
              targetHeight = dCurr.relativeY + t * segmentDist;
              currentActive = t > 0.85 ? i + 1 : i;
            }
            break;
          }
        }

        if (!inSegment) {
          // Past the final checkpoint: travel towards the terminal anchor at the bottom of the timeline
          const lastIdx = N - 1;
          const dLast = validDots[lastIdx];
          if (dLast) {
            const trackEnd = containerRect.height - 12;
            const remainingDist = trackEnd - dLast.relativeY;
            const scrolledPast = triggerY - dLast.screenY;
            const dwell = 120;

            if (scrolledPast <= dwell) {
              targetHeight = dLast.relativeY;
              currentActive = lastIdx;
            } else {
              const totalBottomScroll = Math.max(
                250,
                remainingDist - (window.innerHeight * 0.8 - triggerY)
              );
              const t = smootherstep(dwell, totalBottomScroll, scrolledPast);
              targetHeight = dLast.relativeY + t * remainingDist;
              currentActive = lastIdx;
            }
          }
        }
      }

      beamTarget.set(targetHeight);
      setActiveCheckpoint((prev) => (prev !== currentActive ? currentActive : prev));
      setIsAtEnd((prev) => {
        const next = targetHeight >= containerRect.height - 24;
        return prev !== next ? next : prev;
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTimeline();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    
    updateTimeline();
    const timer = setTimeout(updateTimeline, 200);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(timer);
    };
  }, [beamTarget]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-transparent text-zinc-100 selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* 0. DETAIL MODAL: Portaled to Document Body with scroll lock */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isDetailModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDetailModalOpen(false)}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md h-full w-full z-[100]"
                />
                <div
                  className="fixed inset-0 grid place-items-center z-[101] p-4 sm:p-6 overflow-y-auto overscroll-contain"
                  onWheel={(e) => e.stopPropagation()}
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full max-w-3xl max-h-[88vh] flex flex-col overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] rounded-[32px] bg-gradient-to-b from-[#1c080d]/98 via-[#0e0407]/98 to-[#170511]/98 backdrop-blur-2xl border-[1.5px] border-red-500/40 shadow-[0_0_70px_rgba(239,68,68,0.35)] relative my-auto"
                  >
                    {/* Top specular highlight */}
                    <div className="absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_18px_#f43f5e] pointer-events-none z-20" />

                    {/* Modal Banner Image */}
                    <div className="relative">
                      <img
                        src="/assests/techx.jpeg"
                        alt="TechX 2026 Product Showcase"
                        className="w-full h-64 sm:h-80 object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0407] via-transparent to-black/40" />

                      {/* Modal Category Pill */}
                      <div className="absolute top-5 left-5 z-20">
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/50 bg-[#1f0a0e]/85 backdrop-blur-md px-4 py-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                          <span className="text-[11px] font-mono font-bold tracking-widest text-red-200 uppercase">
                            PRODUCT SHOWCASE
                          </span>
                        </div>
                      </div>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => setIsDetailModalOpen(false)}
                        aria-label="Close dialog"
                        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:border-red-400 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content Details */}
                    <div className="p-6 sm:p-8 space-y-6 text-zinc-300">
                      <div>
                        <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-red-400 mb-1.5">
                          Department of Artificial Intelligence and Data Science
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                          TechX 2026 Product Showcase
                        </h3>
                        <p className="text-red-300/90 font-mono text-xs sm:text-sm mt-1">
                          Ongoing Event • 11th September 2026 • VCET, Vasai
                        </p>
                      </div>

                      {/* Sponsor / Partnership Showcase */}
                      <div className="space-y-2.5">
                        <p className="text-xs font-mono uppercase text-red-300 font-bold tracking-wider">
                          Official Sponsors & Partners
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-red-500/30 backdrop-blur-md">
                            <div className="w-16 h-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                              <img
                                src="/assests/sponsor_tech_computer.png"
                                alt="Tech Computer Education"
                                className="max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white leading-tight truncate">
                                Tech Computer
                              </p>
                              <p className="text-[10px] text-red-300 font-mono uppercase">Powered By</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-red-500/30 backdrop-blur-md">
                            <div className="w-16 h-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                              <img
                                src="/assests/sponsor_angelone.png"
                                alt="AngelOne"
                                className="max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white leading-tight truncate">
                                AngelOne
                              </p>
                              <p className="text-[10px] text-amber-300 font-mono uppercase">Co-Powered By</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-red-500/30 backdrop-blur-md">
                            <div className="w-16 h-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                              <img
                                src="/assests/sponsor_career_launcher.png"
                                alt="Career Launcher"
                                className="max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white leading-tight truncate">
                                Career Launcher
                              </p>
                              <p className="text-[10px] text-amber-300 font-mono uppercase">Co-Powered By</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mission Overview */}
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-red-400" />
                          Mission Overview
                        </h4>
                        <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                          TechX 2026 is the premier Product Showcase organized by the Department of Artificial Intelligence and Data Science at VCET in association with VCET NSDC. Centered on the vision "Charting Ideas into the Uncharted", TechX provides an open platform for student innovators to explore, demonstrate, connect, and build cutting-edge hardware and software products before distinguished industry leaders.
                        </p>
                      </div>

                      {/* Technical Highlights */}
                      <div>
                        <h5 className="text-sm font-mono uppercase tracking-wider text-red-400 font-bold mb-3 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-red-400" />
                          Showcase Highlights & Focus Areas
                        </h5>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-red-500/20 backdrop-blur-sm">
                            <span className="text-red-400 font-bold">•</span>
                            <span>Live product demonstrations across AI, Machine Learning, and Robotics.</span>
                          </li>
                          <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-red-500/20 backdrop-blur-sm">
                            <span className="text-red-400 font-bold">•</span>
                            <span>Direct jury evaluation on real-world impact, architecture, and deployment.</span>
                          </li>
                          <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-red-500/20 backdrop-blur-sm">
                            <span className="text-red-400 font-bold">•</span>
                            <span>Interactive product booths with hands-on prototype test runs.</span>
                          </li>
                          <li className="flex items-start gap-2 bg-black/20 p-3 rounded-xl border border-red-500/20 backdrop-blur-sm">
                            <span className="text-red-400 font-bold">•</span>
                            <span>Networking opportunities with seasoned industry leaders and sponsors.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Awards & Recognition */}
                      <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 backdrop-blur-sm">
                        <h5 className="text-sm font-mono uppercase tracking-wider text-red-400 font-bold mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-red-400" />
                          Prizes & Recognition
                        </h5>
                        <p className="text-xs sm:text-sm text-zinc-300">
                          Excellence trophies for standout product designs, innovation awards, and official certificates of accomplishment recognized by VCET & VCET NSDC.
                        </p>
                      </div>

                      {/* Direct Action Link / Status */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Official Website & Portal Launching Soon</span>
                        </div>
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-mono font-medium">
                          <span>Link Coming Soon</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* 1. HERO SECTION: Ongoing Events + Giant Border-Illuminated Logo + Dates & Details + Drop Button */}
      <section 
        ref={heroRef}
        className="px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 max-w-[1500px] w-full mx-auto flex flex-col items-center justify-center min-h-[85vh] border-b border-red-900/20 relative"
      >
        {/* Atmospheric ambient glows - isolated GPU layer to eliminate reflow lag */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-red-600/18 blur-[160px] rounded-full pointer-events-none transform-gpu will-change-transform" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none transform-gpu will-change-transform" />

        <div className="relative z-10 w-full flex flex-col items-center text-center">
          {/* Ongoing Events Heading in bold head title font with warm beige styling */}
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-heading font-extrabold text-[#F5E6C8] text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] select-none text-center"
          >
            Ongoing Events
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-xs sm:text-sm font-mono uppercase tracking-widest text-red-300/90 mt-2"
          >
            Department of AI & Data Science • Charting Ideas into the Uncharted
          </motion.p>

          {/* Interactive 3D Dimensional Logo with Perspective Mouse-Tilt and Hover Light-Up Effect */}
          <div className="mt-2 sm:mt-3 relative w-full flex justify-center items-center">
            {/* Interactive 3D Dimensional Logo tightly bounded to the logo image */}
            <div 
              className="relative w-fit inline-flex justify-center items-center group [perspective:1200px]"
              onMouseEnter={handleLogoMouseEnter}
              onMouseMove={handleLogoMouseMove}
              onMouseLeave={handleLogoMouseLeave}
            >
              {/* Ambient Radial Backlight that gently highlights on hover */}
              <div className="absolute inset-x-0 inset-y-2 w-full h-full rounded-full bg-gradient-to-r from-red-600/35 via-rose-500/25 to-purple-600/30 blur-[75px] opacity-15 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500 pointer-events-none transform-gpu" />

              <motion.div
                style={{
                  y: logoY,
                  scale: logoScale,
                  opacity: logoOpacity,
                  rotateX: logoRotateX,
                  rotateY: logoRotateY,
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
                whileHover={{ scale: 1.025, y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative z-10 cursor-pointer inline-flex justify-center items-center w-fit will-change-transform transform-gpu"
                onClick={() => setIsDetailModalOpen(true)}
                title="Click to view TechX 2026 details"
              >
                {/* 3D sculpted logo with subtle edge illumination tracing each alphabet on hover */}
                <img
                  src="/assests/techx_3d_logo.png"
                  alt="TechX 2026 3D Event Logo"
                  loading="eager"
                  decoding="async"
                  className="w-auto max-w-[92vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-[1080px] max-h-[42vh] sm:max-h-[46vh] object-contain select-none logo-alphabet-trace scale-x-[1.05] origin-center will-change-transform"
                  style={{ transform: "scaleX(1.05) translateZ(0)" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Event Dates, Time and Venue */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-3 sm:mt-4 text-xs sm:text-sm font-medium"
          >
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 backdrop-blur-md text-zinc-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-white font-semibold">11th September 2026</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 backdrop-blur-md text-zinc-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-zinc-300">10:00 AM – 5:00 PM IST</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 backdrop-blur-md text-zinc-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-zinc-300">VCET, Vasai</span>
            </div>
          </motion.div>

          {/* More Details Button Option */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-3.5 sm:mt-4"
          >
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(true)}
              className="group relative inline-flex items-center gap-2.5 px-7 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:via-rose-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(239,68,68,0.45)] hover:shadow-[0_0_35px_rgba(244,63,94,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 border border-red-300/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-200 group-hover:rotate-12 transition-transform duration-300" />
              <span>More Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-200 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </motion.div>

          {/* Drop Button Connecting to Past Events Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-5 sm:mt-6 flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("chronology-timeline");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                } else {
                  timelineRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group flex flex-col items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 cursor-pointer"
              aria-label="Scroll down to past events timeline"
            >
              <span className="text-xs font-mono tracking-widest uppercase text-purple-300/80 group-hover:text-purple-200 transition-colors">
                Past Events
              </span>
              <div className="w-10 h-10 rounded-full border border-purple-500/40 bg-purple-950/40 backdrop-blur-md flex items-center justify-center group-hover:border-purple-300 group-hover:bg-purple-600/30 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300">
                <ChevronDown className="w-5 h-5 text-purple-300 group-hover:text-white transition-colors" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. SCROLL TIMELINE WITH LIGHTING PATH */}
      <section id="chronology-timeline" className="relative px-4 sm:px-6 lg:px-10 py-28 max-w-[1460px] mx-auto">
        <div className="mb-20">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white font-heading">
            Chronology of Events
          </h2>
          <p className="text-zinc-400 font-mono mt-2 text-sm sm:text-base">
            Scroll down to illuminate past milestones.
          </p>
        </div>

        <div ref={timelineRef} className="relative">
          {/* Static timeline track background - centered precisely at x=24px (left-6 -translate-x-1/2) through the 48px dots */}
          <div className="absolute left-6 -translate-x-1/2 top-6 bottom-3 w-[2px] bg-purple-950/40 border-r border-purple-900/20 pointer-events-none" />

          {/* Dynamic glowing illuminated lighting path docking at checkpoints and following to the end */}
          <motion.div
            style={{ height: smoothBeamHeight }}
            className="absolute left-6 -translate-x-1/2 top-0 w-[2px] bg-gradient-to-b from-purple-500 via-fuchsia-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.9)] z-10 pointer-events-none"
          >
            {/* Leading glowing spark/markup at the scroller tip */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#ffffff,0_0_24px_#a855f7]" />
          </motion.div>

          {/* Terminal End Anchor at the bottom of the timeline path */}
          <div className="absolute left-6 -translate-x-1/2 bottom-0 flex items-center z-20 pointer-events-none">
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 ${
                isAtEnd
                  ? "border-purple-300 bg-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.9)] scale-110"
                  : "border-purple-900/40 bg-zinc-950/70"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isAtEnd
                    ? "bg-white shadow-[0_0_8px_#ffffff,0_0_16px_#a855f7]"
                    : "bg-purple-900/40"
                }`}
              />
            </div>
          </div>

          <div className="space-y-36">
            {TIMELINE_DATA.map((checkpoint, idx) => (
              <TimelineCheckpointRow
                key={checkpoint.year}
                checkpoint={checkpoint}
                idx={idx}
                dotRef={(el) => {
                  dotRefs.current[idx] = el;
                }}
                isCurrentActive={activeCheckpoint === idx}
                isCompleted={activeCheckpoint > idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Floating Scroll to Top button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="p-3.5 rounded-full bg-black/50 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:border-purple-300 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
}