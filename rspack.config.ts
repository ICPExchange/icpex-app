import path from 'node:path'
import { defineConfig } from '@rspack/cli'

export const isProduction = process.env.NODE_ENV === 'production'
const config = defineConfig({
  devtool: isProduction ? false : 'cheap-source-map',
  context: __dirname,
  entry: {
    main: './src/main.tsx',
  },
  output: {
    publicPath: '/',
  },
  builtins: {
    html: [
      {
        template: 'index.html',
      },
    ],
    define: {
      'process.env.DFX_NETWORK':
        process.env.DFX_NETWORK === 'ic'
          ? JSON.stringify('ic')
          : JSON.stringify('local'),
    },
    provide: {
      process: [require.resolve('process/browser')],
      Buffer: ['buffer', 'Buffer'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    fallback: {
      // assert: require.resolve('assert/'),
      // stream: require.resolve('stream-browserify/'),
      // buffer: require.resolve('buffer'),
      assert: false,
      stream: false,
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
        type: 'css',
      },
      {
        test: /\.module\.less$/,
        use: [
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
        type: 'css/module',
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'initial',
      minChunks: 1,
      minSize: 20000,
      maxSize: 0,
      // maxAsyncRequests: 30,
      // maxInitialRequests: 30,
      name: 'vendors',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  devServer: {
    open: true,
    static: 'public',
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
  },
})

module.exports = config
