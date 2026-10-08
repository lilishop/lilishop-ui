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
          // 接口请求失败已由 axios 拦截器统一弹 toast，不再触发错误弹层
          if (error?.name === "AxiosError" || message.startsWith("Request failed with status code")) {
            return false;
          }
          // 腾讯地图 GL 在跨域脚本里抛错时，浏览器只上报 Script error.
          if (message === "Script error." || message.includes("far <= 0") || message.includes("near <= 0")) {
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
        minSize: 30000,
        cacheGroups: {
          // 框架核心单独成 chunk：长期缓存，不随业务代码变化而失效
          framework: {
            test: /[\\/]node_modules[\\/](vue|vue-router|vuex|axios|element-plus|@element-plus|@vue|@vueuse|core-js)[\\/]/,
            name: "chunk-framework",
            priority: 30,
            enforce: true,
          },
          // 首屏直接依赖的其余第三方包合并为一个 chunk，避免上百个小请求
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "chunk-vendor",
            chunks: "initial",
            priority: 20,
          },
        },
      },
    },
  },
  chainWebpack(config) {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@/components/lili", resolve("src/views/my-components/lili"))
      .set("@/components/map", resolve("src/views/my-components/map"))
      .set("@/components/lili-dialog", resolve("src/views/lili-dialog"))
      .set("@/components/hotzone", resolve("src/views/shop/hotzone"));
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
