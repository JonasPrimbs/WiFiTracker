module.exports = {
  pwa: {
    name: 'WiFi Tracker',
    themeColor: '#FF5252',
    msTileColor: '#FF5252',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    iconPaths: {
      favicon16: 'img/icons/favicon-16x16.png',
      favicon32: 'img/icons/favicon-32x32.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    },
    workboxOptions: {
      skipWaiting: true
    }
  },

  baseUrl: undefined,
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,
  css: undefined
}