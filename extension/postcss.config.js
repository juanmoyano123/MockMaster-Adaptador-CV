/**
 * PostCSS configuration for the MockMaster Chrome Extension.
 *
 * Tailwind CSS processes the Tailwind directives (@tailwind base/components/utilities)
 * in globals.css.  Autoprefixer adds vendor prefixes for cross-browser support.
 *
 * This file is consumed by webpack's postcss-loader (see webpack.config.js).
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
