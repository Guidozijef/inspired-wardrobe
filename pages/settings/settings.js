Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    menuTop: 0,
    menuHeight: 32,
    version: '-',
    aiCutoutEnabled: true,
    hdExportEnabled: true,
    cacheSize: '计算中...'
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight
    try {
      const menu = wx.getMenuButtonBoundingClientRect()
      this.setData({
        statusBarHeight,
        navBarHeight: menu.bottom - statusBarHeight,
        menuTop: menu.top,
        menuHeight: menu.height
      })
    } catch (e) {
      this.setData({ statusBarHeight })
    }

    // 读取本地设置
    const aiCutoutEnabled = wx.getStorageSync('setting_ai_cutout')
    const hdExportEnabled = wx.getStorageSync('setting_hd_export')
    this.setData({
      aiCutoutEnabled: aiCutoutEnabled !== false,
      hdExportEnabled: hdExportEnabled !== false
    })

    // 自动获取版本号（发布版返回实际版本，开发版显示 dev）
    try {
      const accountInfo = wx.getAccountInfoSync()
      const ver = accountInfo.miniProgram.version
      this.setData({ version: ver || 'dev' })
    } catch (e) {
      this.setData({ version: 'dev' })
    }

    this.calcCacheSize()
  },

  calcCacheSize() {
    try {
      const info = wx.getFileSystemManager().readdirSync(wx.env.USER_DATA_PATH)
      this.setData({ cacheSize: `已使用 ${info.length} 个缓存文件` })
    } catch (e) {
      this.setData({ cacheSize: '点击可清除缓存' })
    }
  },

  toggleAiCutout(e) {
    const val = e.detail.value
    this.setData({ aiCutoutEnabled: val })
    wx.setStorageSync('setting_ai_cutout', val)
  },

  toggleHdExport(e) {
    const val = e.detail.value
    this.setData({ hdExportEnabled: val })
    wx.setStorageSync('setting_hd_export', val)
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确认清除本地缓存数据？',
      confirmColor: '#7C3AED',
      success: (res) => {
        if (!res.confirm) return
        wx.clearStorage({
          success: () => {
            wx.showToast({ title: '缓存已清除', icon: 'success' })
            this.setData({ cacheSize: '暂无缓存' })
          }
        })
      }
    })
  },

  openPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '灵感衣橱仅收集必要的用户信息用于提供服务，不会向第三方共享您的个人数据。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#7C3AED'
    })
  },

  openTerms() {
    wx.showModal({
      title: '用户协议',
      content: '使用灵感衣橱即表示您同意我们的服务条款。请合理使用本应用，不得上传违法违规内容。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#7C3AED'
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
