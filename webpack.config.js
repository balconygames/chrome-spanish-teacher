const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = false;

module.exports = {
  entry: {
    app: "./src/app.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? "[name].[contenthash].js" : "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/assets", to: "assets" },
      ],
    }),
  ],
  devtool: isProduction ? "source-map" : "inline-source-map",
};
