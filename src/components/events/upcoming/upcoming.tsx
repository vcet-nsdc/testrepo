'use client';

// import eventImg from './event-img.png' // Make sure this path is correct
import EventCard from './EventCard';

const Upcoming: React.FC = () => {
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false) // Moved to EventCard
  // const overlayRef = useRef<HTMLDivElement | null>(null) // Moved to EventCard and internal to EventCard
  // const cardWrapperRef = useRef<HTMLDivElement | null>(null) // Moved to EventCard
  // const cardRef = useRef<HTMLDivElement | null>(null) // Moved to EventCard
  // const frameRef = useRef<number | null>(null) // Moved to EventCard

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Removed useEffect hook as its functionality is no longer needed in Upcoming or moved to EventCard

  const events = [
    {
      title: 'Byteverse 2026',
      dateTime: 'November 2026',
      venue: 'VCET, Vasai',
      shortDescription:
        'Byteverse 2026 is a high-voltage, manga-themed tech competition organized by VCET NSDC. Assemble your squad, pick your domain, and battle it out with the brightest minds across campuses. Whether you code, design, or innovate - this is your arena.',
      imagePath: '/assests/byteverse.jpeg',
      logoPath: '/assests/byteverse_logo_v2.png',
      overview:
        'Byteverse 2026 is a high-voltage, manga-themed tech competition organized by VCET NSDC. Assemble your squad, pick your domain, and battle it out with the brightest minds across campuses. Whether you code, design, or innovate - this is your arena.',
      highlights: [
        'Interactive technical rounds testing diverse computer science knowledge.',
        'Opportunities to learn about the latest industry trends.',
        'Engaging competition format designed to challenge and entertain.',
        'Showcase your technical prowess among peers and win exciting rewards.',
      ],
      awards: [
        'Exciting prizes for the winning teams.',
        'Certificates of participation for all attendees.',
        'Special recognition for top performers in specific domains.',
      ],
      websiteLink: 'https://byteverse-2026.vercel.app',
    },
  ];

  return (
    <div className='font-body flex flex-col justify-center items-center'>
      <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-4 md:pt-36'>
        <div className='text-center mb-10'>
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-1.5 mb-3 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-pink-200">
              Live Competition
            </span>
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-white mb-3 text-balance font-heading'>Ongoing Event</h1>
          <p className='text-base md:text-lg text-purple-200 max-w-xl mx-auto font-body'>
            Assemble your squad, pick your domain, and battle it out in our flagship arena
          </p>
        </div>

        <div className='flex flex-col items-center gap-12'>
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </div>

      <div className='fixed bottom-8 right-8 z-50'>
        <button
          className='bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300'
          onClick={scrollToTop}
          aria-label='Scroll to top'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M5 10l7-7m0 0l7 7m-7-7v18'
            />
          </svg>
        </button>
      </div>

      {/* Removed Modal Section */}

      <style jsx global>{`
        /* Removed pulse-ring animation */
        /* Removed float animation */

        * {
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
        body.modal-open {
          overflow: hidden;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #8b5cf6;
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #a78bfa;
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.12),
            transparent
          );
          transform: rotate(45deg) translateX(-100%) translateY(-100%);
          opacity: 0;
          transition: all 0.6s;
          z-index: 20;
        }
        .shimmer:hover::before {
          opacity: 1;
          transform: rotate(45deg) translateX(100%) translateY(100%);
        }

        /* Removed status-indicator */
        /* Removed gradient-bg */
        /* Removed glass-effect */
        /* Removed loading-spinner */
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .event-card-wrapper {
          perspective: 1200px;
          position: relative;
          z-index: 20;
          transition: z-index 0s 0.6s;
        }
        .event-card-wrapper.is-tilted {
          z-index: 30;
          transition: z-index 0s 0s;
        }
        .event-card {
          transform-style: preserve-3d;
          transition:
            transform 1s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .event-card-wrapper.is-tilted .event-card {
          transform: rotate3d(0.5, 1, 0, 15deg);
          box-shadow:
            rgba(0, 0, 0, 0.3) 30px 50px 25px -40px,
            rgba(0, 0, 0, 0.18) 0px 25px 30px 0px;
        }
        .event-card .card-content {
          position: relative;
          transform-style: preserve-3d;
        }
        .glass-pane {
          position: absolute;
          inset: 8px;
          border-radius: 20px;
          transform: translateZ(20px);
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.1s;
        }
        .event-card-wrapper.is-tilted .glass-pane {
          transform: translateZ(45px);
        }
        .event-card .floating-element {
          transform: translateZ(25px);
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.2s;
          transform-style: preserve-3d;
        }
        .event-card-wrapper.is-tilted .floating-element {
          transform: translateZ(60px);
        }
        .read-more-btn {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.4s;
        }
        .event-card-wrapper.is-tilted .read-more-btn {
          transform: translateZ(90px) scale(1.05);
        }
        .attendee-icons {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.3s;
        }
        .event-card-wrapper.is-tilted .attendee-icons {
          transform: translateZ(80px);
        }
        /* Glassmorphism styles are handled via modern Tailwind classes */
      `}</style>
    </div>
  );
};

export default Upcoming;
