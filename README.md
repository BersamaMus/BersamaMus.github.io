# bersamamus.com

My portfolio site, built with [Astro](https://astro.build).

```sh
npm install
npm run dev      # http://localhost:4321, reloads as you edit
npm run build    # writes the site to dist/
```

## Adding a project

1. Put its images in `src/assets/<project>/`.
2. Add `src/content/projects/<project>.md` (copy `blimp.md` for the fields).
   The home page gets a card, and `/<project>` gets a page built from the Markdown.
3. For a hand-built page like Blimp's, set `customPage: true` and create
   `src/pages/<project>/index.astro`.

## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). `public/CNAME` points it at bersamamus.com.
