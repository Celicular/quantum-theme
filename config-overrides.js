const { override, addWebpackPlugin } = require('customize-cra');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = override(
  // Only apply in production mode
  process.env.NODE_ENV === 'production' && 
    addWebpackPlugin(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // Only compress files larger than 10kb
        minRatio: 0.8 // Only compress files that compress by at least 20%
      })
    ),
  
  // Custom optimization
  (config) => {
    if (process.env.NODE_ENV === 'production') {
      // Optimize chunk size
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name of the npm package
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // Return a custom chunk name
              return `npm.${packageName.replace('@', '')}`;
            },
          },
          // Special chunk for Three.js which is large
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'vendor-three',
            priority: 20,
          },
        },
      };

      // Optimize minimizer
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: true, // Remove console logs
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          parallel: true,
        }),
      ];
    }
    return config;
  }
); 