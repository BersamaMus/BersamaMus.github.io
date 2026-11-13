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
      // The big two-part heading on its page, as on Blimp's and Vessel's: the first
      // line in the text colour, the second in the app's own. Without it, the title.
      headline: z.tuple([z.string(), z.string()]).optional(),
      icon: image(),
      cover: image(),
      coverAlt: z.string(),
      // More screenshots, shown under the text, each with a heading, a line about it
      // and, optionally, how to do it in the app.
      shots: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            title: z.string(),
            caption: z.string(),
            how: z.string().optional(),
          }),
        )
        .default([]),
      platforms: z.array(z.string()),
      // What it runs on, for the line under the download button, e.g.
      // "Windows 10 and 11, 64-bit". Without it, the platforms.
      requirements: z.string().optional(),
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
      // Set for apps with an APK on their GitHub releases. Jeti on Android lists
      // these (from the "android" list in /apps.json) and installs and updates them.
      android: z
        .object({
          // The app's applicationId. Jeti asks Android which version of it is installed.
          package: z.string(),
          // The release asset Jeti downloads, e.g. Blimp.apk.
          apk: z.string(),
        })
        .optional(),
      // Lower numbers come first on the home page.
      order: z.number().default(100),
      // True when the project has a hand-built page in src/pages/<id>/.
      customPage: z.boolean().default(false),
      // The app's own colour, for its card and page: the outline, the Download button
      // and the chips. The site's yellow (Blimp), Vessel's purple, or Glide's turquoise.
      accent: z.enum(['yellow', 'purple', 'turquoise']).default('yellow'),
    }),
});

export const collections = { projects };
