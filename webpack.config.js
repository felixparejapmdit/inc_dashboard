const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  // Entry point of your application
  entry: "./src/index.js",

  // Output configuration
  output: {
    filename: "bundle.js", // Name of the bundled file
    path: path.resolve(__dirname, "dist"), // Directory for the bundled file
    publicPath: "/", // Ensures proper asset referencing for SPAs
  },

  // Mode: Can be 'development' or 'production'
  mode: "development",

  // Enable source maps for easier debugging in development
  devtool: "inline-source-map",

  // Webpack Dev Server configuration
  devServer: {
    static: path.join(__dirname, "dist"), // Serve files from the 'dist' directory
    historyApiFallback: true, // Support for single-page applications
    open: true, // Automatically opens the browser
    hot: true, // Enable hot module replacement
    port: 5000, // Server port
  },

  // Loaders: How webpack processes different types of files
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Process JS and JSX files
        exclude: /node_modules/, // Ignore node_modules
        use: {
          loader: "babel-loader", // Transpile modern JS/JSX code
        },
      },
      {
        test: /\.css$/, // Process CSS files
        use: ["style-loader", "css-loader"], // Inject CSS into the DOM
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Process image files
        type: "asset/resource", // Handle image imports
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i, // Process font files
        type: "asset/resource",
      },
    ],
  },

  // Plugins: Extend Webpack's capabilities
  plugins: [
    new CleanWebpackPlugin(), // Clean the dist folder before every build
    new HtmlWebpackPlugin({
      template: "./src/index.html", // Base the output on this template
      title: "Your Project Title", // Set your project's HTML title
    }),
  ],

  // Resolve options for module resolution
  resolve: {
    extensions: [".js", ".jsx"], // Automatically resolve .js and .jsx extensions
    fallback: {
      stream: require.resolve("browserify-stream"),
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer"),
      assert: require.resolve("assert"),
      util: require.resolve("util"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      url: require.resolve("url"),
    },
  },
};
