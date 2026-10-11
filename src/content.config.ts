import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/projects. Each one gets a card
// on the home page and, unless it has its own page in src/pages, a page at /<file name>.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      icon: image(),
      cover: image(),
      coverAlt: z.string(),
      platforms: z.array(z.string()),
      tech: z.array(z.string()),
      github: z.string().optional(),
      // Lower numbers come first on the home page.
      order: z.number().default(100),
      // True when the project has a hand-built page in src/pages/<id>/.
      customPage: z.boolean().default(false),
    }),
});

export const collections = { projects };
