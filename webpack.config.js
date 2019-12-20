module.exports = {
  output: {
    library: 'YG',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      type: 'javascript/esm',
      exclude: /node_modules/
      // use: {
      //   loader: 'babel-loader'
      // }
    }]
  }
}
