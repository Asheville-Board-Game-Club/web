# Asheville Board Game Club website

Static site built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare Pages.

## Development

```sh
yarn install
yarn start      # dev server at http://localhost:8080
yarn test       # unit tests (Jest)
yarn checkall   # lint, format check, typecheck, tests, and build
```

## Content

- Pages live in `src/` as Markdown (`*.md`); Nunjucks tags (`{{ }}`, `{% %}`) work inside them. Shared header/nav/footer: `src/_includes/layouts/base.njk`.
- Nav tabs and social links: `src/_data/site.js`.
- News posts: add `src/news/posts/YYYY-MM-DD-slug.md` with a `title` in the front matter.
- Meetup cards are rendered in the browser from `src/data/meetups.json` (served at `/data/meetups.json`).
  Browser code is TypeScript in `src/ts/`; esbuild bundles `meetups-page.ts` to `/js/meetups.js` during the Eleventy build.
- Social icons in `src/_includes/icons/` are from [Simple Icons](https://simpleicons.org/) (CC0), recolored with each brand's color.
- Anything with `class="placeholder"` is content still to be written.

## Cloudflare Pages settings

- Build command: `yarn build`
- Build output directory: `_site`
- Node version comes from `.nvmrc`.
