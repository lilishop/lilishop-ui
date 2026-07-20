const path = require("path");
const configs = require("./src/config");
const CompressionPlugin = require("compression-webpack-plugin");

const resolve = (dir) => path.join(__dirname, dir);

const enableProduction = process.env.NODE_ENV === "production";

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_PATH || "/",
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
      scss: {
        sassOptions: {
          silenceDeprecations: ["legacy-js-api", "import"],
        },
      },
      sass: {
        sassOptions: {
          silenceDeprecations: ["legacy-js-api", "import"],
        },
      },
    },
  },
  devServer: {
    port: configs.port,
    client: {
      overlay: {
        runtimeErrors: (error) => {
          const message = error?.message || "";
          if (message.includes("ResizeObserver loop")) {
            return false;
          }
          return true;
        },
      },
    },
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
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context && module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              );
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
      return args;
    });
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "scss",
      patterns: [path.resolve(__dirname, "./src/styles/common.scss")],
    },
  },
};
