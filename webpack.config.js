module.exports = {
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
