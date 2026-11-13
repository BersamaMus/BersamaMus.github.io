// The catalog Jeti, the launcher, reads: every project with a Windows installer
// ("apps") and every one with an Android APK ("android"). Jeti gets each app's
// latest version from its GitHub releases, so this only changes when a project
// is added or its details change.
//
// "apps" keeps the shape Jeti 1.0 for Windows reads (it needs appId, installer
// and exe on every entry), so Android apps get a list of their own.
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';

type Project = CollectionEntry<'projects'>;

// What every app has, on either list.
async function common({ id, data }: Project, site: URL) {
  const icon = await getImage({ src: data.icon, width: 128, height: 128, format: 'png' });
  return {
    id,
    title: data.title,
    tagline: data.tagline,
    icon: new URL(icon.src, site).href,
    page: new URL(`/${id}`, site).href,
    // owner/name, from https://github.com/owner/name
    repo: new URL(data.github!).pathname.replace(/^\/|\/$/g, ''),
  };
}

export const GET: APIRoute = async ({ site }) => {
  const projects = (await getCollection('projects', (p) => p.data.github)).sort((a, b) => a.data.order - b.data.order);

  const apps = await Promise.all(
    projects.filter((p) => p.data.windows).map(async (p) => ({ ...(await common(p, site!)), ...p.data.windows! })),
  );
  const android = await Promise.all(
    projects.filter((p) => p.data.android).map(async (p) => ({ ...(await common(p, site!)), ...p.data.android! })),
  );

  return new Response(JSON.stringify({ version: 1, apps, android }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
