const path = require('path');

module.exports = {
  mode: 'production',
  devtool: "source-map",
  entry: './src/main.ts',
  output: {
    filename: 'script.js',
    path: path.resolve(__dirname, '../public'),
    library: 'audio',
    libraryTarget: 'window',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
};
