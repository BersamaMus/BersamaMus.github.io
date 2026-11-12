// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bersamamus.com',
  // Projects is the front page now, so old links to /projects go there.
  redirects: { '/projects': '/' },
});
