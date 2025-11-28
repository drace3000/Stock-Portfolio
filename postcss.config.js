/**
 * postcss.config.js
 * 
 * PostCSS configuration file.
 * 
 * Configures PostCSS plugins:
 * - tailwindcss: Processes Tailwind CSS directives
 * - autoprefixer: Automatically adds vendor prefixes to CSS
 * 
 * PostCSS processes CSS files during the Next.js build process,
 * transforming Tailwind classes and adding browser compatibility prefixes.
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}


