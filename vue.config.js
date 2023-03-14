let devProxy = {
  //获取疫情数据1
  '/dataSource1': {
    target: process.env.VUE_APP_1,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/dataSource1': ''
    },
  },

  //获取疫情数据2
  '/dataSource2': {
    target: process.env.VUE_APP_2,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/dataSource2': ''
    },
  },
  //获取ip信息
  '/getIpMsg': {
    target: process.env.VUE_APP_3,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/getIpMsg': ''
    },
  },
};
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,  // 修改成false  eslint检测
  publicPath: './',
  devServer: {
    port: 8080,
    open: false,
    proxy: devProxy
  },
})
