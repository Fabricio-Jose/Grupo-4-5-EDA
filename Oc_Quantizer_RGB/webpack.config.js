const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let config = {
  entry: './src/index.ts',
  //  it'll resolve when imports occur
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    contentBase: './dist',
    port: 4000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    // publicPath: 'dist', //if i activate this the changes with not reflect
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
};
module.exports = (env, argv) => {
  console.log({ env: env, argv: argv });
  if (env.dev === true) {
    config.devtool = 'eval-source-map';
    config.mode = 'development';
  }
  if (env.prod === true) {
    config.mode = 'production';
  }
  return config;
};
