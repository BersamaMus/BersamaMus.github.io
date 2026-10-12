// The catalog Jeti, the launcher, reads: every project with a Windows installer.
// Jeti gets each app's latest version from its GitHub releases, so this only
// changes when a project is added or its details change.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects', (p) => p.data.windows && p.data.github);
  projects.sort((a, b) => a.data.order - b.data.order);

  const apps = await Promise.all(
    projects.map(async ({ id, data }) => {
      const icon = await getImage({ src: data.icon, width: 128, height: 128, format: 'png' });
      return {
        id,
        title: data.title,
        tagline: data.tagline,
        icon: new URL(icon.src, site).href,
        page: new URL(`/${id}`, site).href,
        // owner/name, from https://github.com/owner/name
        repo: new URL(data.github!).pathname.replace(/^\/|\/$/g, ''),
        ...data.windows!,
      };
    }),
  );

  return new Response(JSON.stringify({ version: 1, apps }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
