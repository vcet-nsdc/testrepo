import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ContactView } from '@/components/contact/contact-view';
import { LoadingState } from '@/components/ui/loading';
import { APP_CONFIG } from '@/lib/constants';
import './contact.css';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the official VCET NSDC Student Chapter team for event inquiries, sponsorships, hackathon partnerships, and campus collaborations at VCET Vasai.',
  keywords: ['Contact VCET NSDC', 'VCET Vasai Address', 'NSDC Sponsorships', ...APP_CONFIG.keywords],
  openGraph: {
    title: 'Contact Us | VCET NSDC',
    description:
      'Get in touch with the official VCET NSDC Student Chapter team for event inquiries and collaborations.',
    url: `${APP_CONFIG.url}/contact`,
    siteName: APP_CONFIG.name,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-full">
      <Suspense fallback={<LoadingState message="Loading contact experience..." />}>
        <ContactView />
      </Suspense>
    </main>
  );
}
