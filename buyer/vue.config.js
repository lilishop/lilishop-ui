const path = require("path");
const configs = require("./src/config");
const CompressionPlugin = require("compression-webpack-plugin");

const resolve = (dir) => path.join(__dirname, dir);
const enableProduction = process.env.NODE_ENV === "production";

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH || "/",
  outputDir: "dist",
  assetsDir: "static",
  css: {
    sourceMap: false,
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/global.scss";`,
        sassOptions: {
          silenceDeprecations: ["legacy-js-api", "import"],
        },
      },
      scss: {
        additionalData: `@import "@/assets/styles/global.scss";`,
        sassOptions: {
          silenceDeprecations: ["legacy-js-api", "import"],
        },
      },
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },
  devServer: {
    port: configs.port,
  },
  productionSourceMap: false,
  configureWebpack: {
    plugins: enableProduction
      ? [
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css/,
            threshold: 10240,
          }),
        ]
      : [],
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test(module) {
              if (!module.context) return false;
              if (/[\\/]node_modules[\\/]vue-qr[\\/]/.test(module.context)) {
                return false;
              }
              return /[\\/]node_modules[\\/]/.test(module.context);
            },
            name(module) {
              const match =
                module.context &&
                module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              const packageName = match ? match[1] : "vendor";
              return `npm.${packageName.replace("@", "")}`;
            },
          },
        },
      },
    },
  },
  chainWebpack(config) {
    config.resolve.alias.set("@", resolve("src"));
    config.plugin("html").tap((args) => {
      args[0].cdn = { css: [], js: [] };
      args[0].title = configs.title;
      return args;
    });
  },
};
