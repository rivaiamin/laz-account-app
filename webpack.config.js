const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/app.ts"),
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: "[name].js"
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader"
          },
          /* {
            loader: 'angularjs-template-loader',
            options: {
              relativeTo: path.resolve(__dirname, 'app/src')
            }
          } */
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: 'style-loader'
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader',
            options: {
              url: false,
            }
          },
          /* {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('autoprefixer')
                ];
              }
            }
          }, */
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/fonts/'
            }
          }
        ]
      },
      {
        test: /\.(jpeg|jpg|svg|png)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/images/'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
            }
          }
        ]
      },
      { 
        test: /\.html$/, 
        use: [{
          loader: 'raw-loader'
        }]
      }
    ]
  },
  optimization: {
    // We no not want to minimize our code.
    // minimize: false
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `vendor.${packageName.replace('@', '')}`;
          }
        },
      },
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new HtmlWebpackPlugin({
      template: 'src/app.html',
      /* chunksSortMode: 'manual',
      chunks: [ 'runtime', 'vendor.jquery', 'vendor.semantic-ui-css', 'vendor.uirouter', 'vendor.ngstorage', 'vendor.ng-file-upload',
       'vendor.angular-ui-router', 'vendor.angular-resource', 'vendor.angular-sanitize', 'vendor.angular-message', 'vendor.angular',
       'vendor.webpack', 'vendor.css-loader', 'vendor.style-loader', 'vendor.sweetalert2', 'app'], */
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      hash: true,
      filename: "index.html",
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "public"),
    historyApiFallback: true,
    compress: true,
    port: 8081,
    watchContentBase: true
  }
};