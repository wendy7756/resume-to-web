import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
	work: defineCollection({
		// Load Markdown files in the src/content/work directory.
		loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),
			demo_url: z.string().optional(),
			category: z.string().optional(),
			technology: z.string().optional(),
			author: z.string().optional(),
			author_url: z.string().optional(),
			github_url: z.string().optional(),
			license: z.string().optional(),
			stars: z.number().optional(),
			is_official: z.boolean().optional(),
			is_featured: z.boolean().optional(),
		}),
	}),
    blog: defineCollection({
        // Blog posts in src/content/blog
        loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
        schema: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.string().optional(),
            slug: z.string().optional(),
            canonical_url: z.string().optional(),
            robots: z.string().optional(),
            author: z.string(),
            date: z.coerce.date(),
            heroImage: z.string().optional(),
            tags: z.array(z.string()).optional(),
        }),
    }),
};
