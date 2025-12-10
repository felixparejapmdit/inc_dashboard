// webpack.config.js

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  // Entry point of your application
  entry: "./src/index.js",

  // Output configuration
  output: {
    filename: "bundle.js", 
    path: path.resolve(__dirname, "dist"), 
    publicPath: "/", 
  },

  // Mode: Can be 'development' or 'production'
  mode: "development",

  // Enable source maps for easier debugging in development
  devtool: "inline-source-map",

  // Webpack Dev Server configuration
  devServer: {
    static: path.join(__dirname, "dist"),
    historyApiFallback: true,
    open: true, 
    hot: true, 
    port: 5000, 
  },

  // Loaders: How webpack processes different types of files
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },

  // Plugins: Extend Webpack's capabilitiesss
  plugins: [
    new CleanWebpackPlugin(), 
    new HtmlWebpackPlugin({
      template: "./src/index.html", 
      title: "Your Project Title", 
    }),
  ],

  // Resolve options for module resolution
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer"),
      assert: require.resolve("assert"),
      util: require.resolve("util"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process"),
      http: require.resolve("stream-http"),
      // ✅ This line correctly maps 'https' to the browser polyfill.
      https: require.resolve("https-browserify"), 
      os: require.resolve("os-browserify/browser"),
      url: require.resolve("url"),
    },
  },
};