const webpack = require("webpack");

module.exports = {
  node: { global: true },
  resolve: {
    fallback: {
      crypto: false,
      stream: false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: ["process"],
    }),
  ],
};
