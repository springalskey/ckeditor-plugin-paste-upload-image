const path = require('path');
module.exports = {
  entry: './src/plugin.js',
  output: {
    path: path.resolve(__dirname, 'dist/pasteUploadImage'),
    filename: 'plugin.js'
  },
  module: {
    rules: [
      { 
        test: /\.js$/, 
        use: 'babel-loader', 
        exclude: /node_modules/
      },
    ]
  }
};