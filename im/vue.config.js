const path = require('path')

// compression-webpack-plugin，添加压缩文件类型
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
const isProd = process.env.NODE_ENV === 'production'

function resolve(dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
const vueConfig = {
  // 公共路径(必须有的)
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',
  // 输出文件目录
  outputDir: 'dist',
  // 静态资源存放的文件夹(相对于ouputDir)
  assetsDir: 'static',
  runtimeCompiler: false,
  devServer: {
    port: 8000,
    // proxy: {
    //   //配置跨域
    //   '/api': {
    //     target: 'http://api.xxxx.com', // 后台接口域名
    //     ws: false, //如果要代理 websockets，配置这个参数
    //     secure: false, // 如果是https接口，需要配置这个参数
    //     changeOrigin: true, //是否跨域
    //     pathRewrite: {
    //       '^/api': '/api',
    //     },
    //   },
    // },
  },
  configureWebpack: {
    // webpack plugins
    plugins: [
      // 配置大文件压缩相关参数
      new CompressionWebpackPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],

  },

  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src'))

    config.module.rule('svg').exclude.add(resolve('src/icons/svg')).end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })

  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        //全局加载 less 变量
        path.resolve(__dirname, './src/assets/css/variable.less'),
      ],
    },
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {},
          javascriptEnabled: true,
        },
      },
    },
  },

  // 是否为生产环境构建生成 source map？
  productionSourceMap: false,
  // lintOnSave: undefined,
  lintOnSave: false,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: [],
}

module.exports = vueConfig
