# Asheville Board Game Club website

Static site built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare Pages.

## Development

```sh
yarn install
yarn start      # dev server at http://localhost:8080
yarn test       # unit tests (Jest)
yarn validate-data  # check src/data/meetups.json (also runs as part of yarn build, so a bad edit fails the deploy)
yarn checkall   # lint, format check, typecheck, tests, and build
```

Once per clone, enable the git hooks so a commit that includes an invalid `src/data/meetups.json` is rejected:

```sh
git config core.hooksPath .githooks
```

## Content

- Pages live in `src/` as Markdown (`*.md`); Nunjucks tags (`{{ }}`, `{% %}`) work inside them. Shared header/nav/footer: `src/_includes/layouts/base.njk`.
- Nav tabs and social links: `src/_data/site.js`.
- The Home page's upcoming meetups (next 30 days, Asheville time) and the Meetups page cards are rendered in the browser from `src/data/meetups.json` (served at `/data/meetups.json`).
  Browser code is TypeScript in `src/ts/`; esbuild bundles `home-page.ts` and `meetups-page.ts` to `/js/home.js` and `/js/meetups.js` during the Eleventy build.
- Social icons in `src/_includes/icons/` are from [Simple Icons](https://simpleicons.org/) (CC0), recolored with each brand's color.
- Anything with `class="placeholder"` is content still to be written.

## Cloudflare Pages settings

- Build command: `yarn build`
- Build output directory: `_site`
- Node version comes from `.nvmrc`.
