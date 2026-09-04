import type { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import EventModel from '@/models/EventModel';
import { APP_CONFIG } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url;

  // Baseline static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/socials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let eventRoutes: MetadataRoute.Sitemap = [];

  try {
    await connectToDatabase();
    const events = await EventModel.find({ status: 'published' }).select('slug updatedAt').lean();

    eventRoutes = events.flatMap((ev) => [
      {
        url: `${baseUrl}/events/${ev.slug}`,
        lastModified: ev.updatedAt ? new Date(ev.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/events/${ev.slug}/register`,
        lastModified: ev.updatedAt ? new Date(ev.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ]);
  } catch (error) {
    console.error('Sitemap event fetch error:', error);
  }

  return [...staticRoutes, ...eventRoutes];
}
