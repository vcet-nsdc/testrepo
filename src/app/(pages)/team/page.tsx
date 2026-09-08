import { Metadata } from 'next';
import Teams from '@/components/team/Teams';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Our Core Team',
  description: 'Meet the passionate student leaders, committee members, and mentors behind VCET NSDC Student Chapter at Vidyavardhini\'s College of Engineering and Technology.',
  keywords: ['VCET NSDC Team', 'NSDC Core Committee', 'VCET Student Leaders', ...APP_CONFIG.keywords],
  openGraph: {
    title: 'Our Core Team | VCET NSDC',
    description: 'Meet the passionate student leaders and mentors behind VCET NSDC.',
    url: `${APP_CONFIG.url}/team`,
    siteName: APP_CONFIG.name,
  },
};

export default function TeamPage() {
  return (
    <main className="min-h-full py-20">
      <div className="max-w-7xl mx-auto px-6">
        <Teams />
      </div>
    </main>
  );
}
