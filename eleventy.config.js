export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/img');
  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/js');

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
