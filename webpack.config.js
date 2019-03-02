const path = require('path');
const PrettierPlugin = require('prettier-webpack-plugin');

module.exports = {
  entry: './src/THREEAR.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    library: 'THREEAR',
    libraryTarget: "umd",
    filename: 'THREEAR.js',
    path: __dirname + '/dist'
  },
  plugins: [
    new PrettierPlugin()
  ]
};
