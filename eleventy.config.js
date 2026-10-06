import { readFileSync } from 'node:fs';
import * as esbuild from 'esbuild';

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/img');
  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/data');

  // Browser code is TypeScript; esbuild bundles each page entry point into _site/js. Type checking is `yarn typecheck`.
  eleventyConfig.addWatchTarget('src/ts/');
  eleventyConfig.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: { meetups: 'src/ts/meetups-page.ts' },
      bundle: true,
      format: 'esm',
      target: 'es2020',
      minify: true,
      sourcemap: true,
      outdir: '_site/js',
    });
  });

  // Inline SVG, trimmed so an icon can sit inside a single Markdown line such as a heading.
  eleventyConfig.addShortcode('icon', (name) => readFileSync(`src/_includes/icons/${name}.svg`, 'utf8').trim());

  eleventyConfig.addFilter('readableDate', (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
  );

  return {
    // Nunjucks everywhere so .md and .html pages share the same template syntax as the layouts.
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: { input: 'src', includes: '_includes', data: '_data' },
  };
}
