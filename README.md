# Asheville Board Game Club website

Static site built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare Pages.

## Development

```sh
yarn install
yarn start      # dev server at http://localhost:8080
yarn checkall   # lint, format check, and build
```

## Content

- Pages live in `src/` as Markdown (`*.md`); Nunjucks tags (`{{ }}`, `{% %}`) work inside them. Shared header/nav/footer: `src/_includes/layouts/base.njk`.
- Nav tabs and social links: `src/_data/site.js`.
- News posts: add `src/news/posts/YYYY-MM-DD-slug.md` with a `title` in the front matter.
- Anything with `class="placeholder"` is content still to be written.

## Cloudflare Pages settings

- Build command: `yarn build`
- Build output directory: `_site`
- Node version comes from `.nvmrc`.
