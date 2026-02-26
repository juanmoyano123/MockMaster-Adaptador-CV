const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const ROOT = path.resolve(__dirname);
const SRC = path.resolve(ROOT, 'src');
const DIST = path.resolve(ROOT, 'dist');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    // Webpack needs multiple entry points: one per independent bundle.
    // The sidepanel React app, background service worker, and content scripts
    // must be separate bundles because they run in different Chrome contexts.
    entry: {
      'background/service-worker': path.resolve(SRC, 'background/service-worker.ts'),
      'content-scripts/linkedin-extractor': path.resolve(SRC, 'content-scripts/linkedin-extractor.ts'),
      'content-scripts/indeed-extractor': path.resolve(SRC, 'content-scripts/indeed-extractor.ts'),
      'content-scripts/auth-relay': path.resolve(SRC, 'content-scripts/auth-relay.ts'),
      'sidepanel/index': path.resolve(SRC, 'sidepanel/index.tsx'),
    },

    output: {
      path: DIST,
      filename: '[name].js',
      clean: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@shared': path.resolve(SRC, 'shared'),
        '@sidepanel': path.resolve(SRC, 'sidepanel'),
      },
    },

    module: {
      rules: [
        // TypeScript and TSX files
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              // Transpile-only mode speeds up incremental builds in dev.
              // Type errors are still caught by `npm run type-check`.
              transpileOnly: isDev,
              compilerOptions: {
                noEmit: false,
              },
            },
          },
          exclude: /node_modules/,
        },
        // CSS files (Tailwind directives are processed by PostCSS)
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['tailwindcss', 'autoprefixer'],
                },
              },
            },
          ],
        },
        // SVG and image assets
        {
          test: /\.(png|svg|jpg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
      ],
    },

    plugins: [
      // Replace `process.env.NODE_ENV` at compile time so code that branches
      // on development vs production works correctly in the Chrome extension
      // context where `process` does not exist at runtime (node: false).
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode || 'production'),
      }),

      // Extract CSS into a separate file so the sidepanel can load it as
      // a <link> tag instead of injecting it via JS (required for CSP).
      new MiniCssExtractPlugin({
        filename: '[name].css',
        // The sidepanel bundle outputs its CSS to sidepanel/index.css,
        // but we rename it to sidepanel/styles.css in the CopyWebpackPlugin
        // step below to match the index.html reference.
      }),

      // Copy static files that don't go through the webpack pipeline.
      new CopyWebpackPlugin({
        patterns: [
          // Manifest must land at dist/manifest.json
          {
            from: path.resolve(ROOT, 'manifest.json'),
            to: DIST,
          },
          // HTML entry for the sidepanel React app
          {
            from: path.resolve(SRC, 'sidepanel/index.html'),
            to: path.resolve(DIST, 'sidepanel/index.html'),
          },
          // Icon assets (PNGs copied verbatim)
          {
            from: path.resolve(SRC, 'assets/icons'),
            to: path.resolve(DIST, 'assets/icons'),
          },
        ],
      }),
    ],

    optimization: {
      minimizer: [
        '...', // Keep default JS minimizer (TerserPlugin)
        new CssMinimizerPlugin(),
      ],
    },

    // Source maps: use inline-source-map in dev for easy debugging,
    // omit in production to keep bundle size small and avoid leaking source.
    devtool: isDev ? 'inline-source-map' : false,

    // Chrome extension context has no browser-specific globals; disable them
    // so webpack does not inject a fake `process` or `Buffer`.
    node: false,
  };
};
