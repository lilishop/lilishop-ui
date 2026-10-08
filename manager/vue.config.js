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
          // axios 请求错误已由拦截器统一 toast 提示，不再重复弹浮层
          if (
            error?.isAxiosError ||
            error?.name === "AxiosError" ||
            message.includes("Request failed with status code") ||
            message.includes("Network Error") ||
            message.includes("timeout of")
          ) {
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
    if (enableProduction) {
      // 生产环境移除所有 console.* 调用
      config.optimization.minimizer("terser").tap((args) => {
        const terserOptions = args[0].terserOptions || (args[0].terserOptions = {});
        terserOptions.compress = { ...terserOptions.compress, drop_console: true };
        return args;
      });
    }
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "scss",
      patterns: [path.resolve(__dirname, "./src/styles/variables.scss")],
    },
  },
};
