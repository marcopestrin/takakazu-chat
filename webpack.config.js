const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.json$/,
        use: 'json-loader',
      },
      {
        test: /\.(js)x?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(ts)x?$/,
        exclude: /node_modules|\.d\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
          compilerOptions: {
          noEmit: false,
         },
        },
       },
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
