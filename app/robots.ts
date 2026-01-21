import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://f1apex.com'; // Replace with actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/private/'], // Protect admin routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
