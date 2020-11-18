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
  devtool: "source-map",
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    library: 'THREEAR',
    libraryTarget: "umd",
    filename: 'THREEAR.js',
    path: __dirname + '/dist'
  },
  externals: {
    three: {
      commonjs: 'three',
      commonjs2: 'three',
      amd: 'three',
      root: 'THREE' // indicates global variable
    }
  },
  plugins: [
    new PrettierPlugin({
      extensions: ['.ts']
    })
  ]
};
