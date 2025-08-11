import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const siteUrl = 'https://resumehub.com'; // 替换为你的实际域名

export const GET: APIRoute = async () => {
  // 获取所有作品/模板页面
  const workEntries = await getCollection('work');
  // 获取所有博客文章
  const blogEntries = await getCollection('blog');
  
  // 静态页面列表
  const staticPages = [
    {
      url: '',
      changefreq: 'daily',
      priority: '1.0',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'about',
      changefreq: 'monthly', 
      priority: '0.8',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'work',
      changefreq: 'weekly',
      priority: '0.9',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'template',
      changefreq: 'weekly',
      priority: '0.9', 
      lastmod: new Date().toISOString(),
    },
    {
      url: 'roadmap',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'rlog',
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'terms',
      changefreq: 'yearly',
      priority: '0.3',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'privacy',
      changefreq: 'yearly',
      priority: '0.3',
      lastmod: new Date().toISOString(),
    },
    {
      url: 'blog',
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: new Date().toISOString(),
    },
  ];

  // 动态页面 - 作品/模板详情页
  const workPages = workEntries.map((entry) => ({
    url: `work/${entry.id}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: entry.data.publishDate ? entry.data.publishDate.toISOString() : new Date().toISOString(),
  }));

  // 动态页面 - 博客文章页
  const blogPages = blogEntries.map((entry) => ({
    url: `blog/${entry.id}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: entry.data.publishDate ? entry.data.publishDate.toISOString() : new Date().toISOString(),
  }));

  // 合并所有页面
  const allPages = [...staticPages, ...workPages, ...blogPages];

  // 生成 XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}/${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    },
  });
};
