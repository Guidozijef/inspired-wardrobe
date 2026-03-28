Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    menuTop: 0,
    menuHeight: 32
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
  },

  goBack() {
    wx.navigateBack()
  }
})
