/**
 * ==============================================================================
 * Vue CLI 配置文件 (vue.config.js)
 * ==============================================================================
 * 
 * 官方文档: https://cli.vuejs.org/zh/config/
 * 主要配置功能：
 * 1. 部署子路径与打包输出目录设置
 * 2. 本地开发服务器 (devServer) 端口及代理跨域规则
 * 3. Gzip 打包压缩插件 (CompressionWebpackPlugin) 配置
 * 4. SVG 图标雪碧图 (svg-sprite-loader) 解析
 * 5. 全局 Less 样式变量自动注入 (style-resources-loader)
 * 6. 构建优化与 SourceMap 控制
 */

const path = require('path')

// 引入 Gzip 压缩插件，用于生产环境减小打包产物体积，提升加载速度
const CompressionWebpackPlugin = require('compression-webpack-plugin')

// 需要进行 Gzip 压缩的文件后缀类型
const productionGzipExtensions = ['js', 'css']

// 判断当前是否为生产构建环境
const isProd = process.env.NODE_ENV === 'production'

/**
 * 路径转换辅助函数：将相对路径转换为绝对路径
 * @param {string} dir 相对 src 或根目录的路径
 * @returns {string} 绝对路径
 */
function resolve(dir) {
  return path.join(__dirname, dir)
}

const vueConfig = {
  /**
   * 部署应用包时的基本 URL (部署路径)
   * 默认使用根路径 '/'，若部署在二级子目录下（例如 '/im/'），可通过环境变量 VUE_APP_PUBLIC_PATH 指定
   */
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',

  /**
   * 生产环境构建输出文件的目录名称 (执行 npm run build 后的打包产物目录)
   */
  outputDir: 'dist',

  /**
   * 放置生成的静态资源 (js、css、img、fonts) 的相对于 outputDir 的目录
   */
  assetsDir: 'static',

  /**
   * 是否使用包含运行时编译器的 Vue 构建版本
   * 设置为 false 可以减少打包体积约 10KB
   */
  runtimeCompiler: false,

  /**
   * 本地开发服务器配置
   */
  devServer: {
    // 本地开发运行端口号，默认为 8000
    port: 8000,

    /**
     * 本地开发跨域代理配置 (Proxy)
     * 若本地直接请求后端 API 遇到跨域 (CORS) 限制，可在此开启反向代理
     */
    // proxy: {
    //   '/api': {
    //     target: 'http://127.0.0.1:8885', // 后台 IM 接口域名或 IP
    //     ws: true,                        // 是否代理 websockets
    //     secure: false,                   // 若为 https 自签名证书接口设为 false
    //     changeOrigin: true,              // 是否允许跨域改变 host 来源
    //     pathRewrite: {
    //       '^/api': '/api',               // 路径重写规则
    //     },
    //   },
    // },
  },

  /**
   * Webpack 原生对象式配置
   */
  configureWebpack: {
    // Webpack 插件列表
    plugins: [
      /**
       * 配置 Gzip 压缩插件
       * 对体积大于 10KB 的 JS/CSS 文件生成对应的 .gz 预压缩文件
       * 需配合 Nginx 的 gzip_static on 指令直接下发，减少服务器 CPU 动态压缩消耗
       */
      new CompressionWebpackPlugin({
        filename: '[path][base].gz',                                           // 压缩后的文件命名规则
        algorithm: 'gzip',                                                     // 压缩算法
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),   // 匹配要压缩的文件类型
        threshold: 10240,                                                      // 仅对超过 10KB 的资源进行压缩 (单位: 字节)
        minRatio: 0.8,                                                         // 只有压缩率好于 0.8 时才生成压缩文件
      }),
    ],
  },

  /**
   * Webpack 链式配置 (Chain Webpack)，细粒度修改内部 loader 与规则
   */
  chainWebpack: config => {
    // 1. 配置路径别名：设置 '@' 指向 'src' 目录，便于在代码中快速引入组件和工具库
    config.resolve.alias.set('@', resolve('src'))

    // 2. 配置内置 svg 规则：排除 src/icons/svg 目录，避免与下面的 svg-sprite-loader 冲突
    config.module.rule('svg').exclude.add(resolve('src/icons/svg')).end()

    // 3. 配置自定义 svg-icon 规则：将 src/icons/svg 下的 SVG 文件打包为 SVG Sprite 雪碧图
    //    可以在项目中使用 <svg-icon icon-class="icon-name" /> 统一渲染矢量图标
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]', // 生成的 symbol ID 命名规则
      })
  },

  /**
   * 第三方插件配置项
   */
  pluginOptions: {
    // 自动在所有单文件组件中引入 Less 全局变量，无需在每个 .vue 文件手动 @import
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        // 全局 Less 主题变量文件绝对路径
        path.resolve(__dirname, './src/assets/css/variable.less'),
      ],
    },
  },

  /**
   * CSS 预处理器相关配置
   */
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {},        // Less 变量覆盖
          javascriptEnabled: true, // 允许 Less 中执行 JavaScript 表达式 (Ant Design / 部分组件库必需)
        },
      },
    },
  },

  /**
   * 是否为生产环境构建生成 Source Map
   * 设置为 false 可以大幅加速生产打包速度，并防止源码泄露
   */
  productionSourceMap: false,

  /**
   * 是否在保存代码时通过 eslint-loader 执行检查
   * 设置为 false 关闭保存时的编译中断
   */
  lintOnSave: false,

  /**
   * 默认情况下 babel-loader 会忽略所有 node_modules 中的文件
   * 若依赖库使用了 ES6+ 特性需要被转译，可在此数组中显式配置该依赖名称
   */
  transpileDependencies: [],
}

module.exports = vueConfig
