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
      // Set for apps with a Windows installer on their GitHub releases. Jeti, the
      // launcher, lists these (from /apps.json) and installs and updates them.
      windows: z
        .object({
          // The Inno Setup AppId, without the braces. Jeti finds the installed
          // version under it in the registry.
          appId: z.string(),
          // The release asset Jeti downloads, e.g. Blimp-Setup.exe.
          installer: z.string(),
          // The app's exe in its install folder, to open it and to close it before an update.
          exe: z.string(),
        })
        .optional(),
      // Lower numbers come first on the home page.
      order: z.number().default(100),
      // True when the project has a hand-built page in src/pages/<id>/.
      customPage: z.boolean().default(false),
      // The app's own colour, for its card's chips: the site's yellow, or Vessel's purple.
      accent: z.enum(['yellow', 'purple']).default('yellow'),
    }),
});

export const collections = { projects };
