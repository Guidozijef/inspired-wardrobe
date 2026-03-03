Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
  },
  goBack() {
    wx.navigateBack();
  },
  clearHistory() {
    wx.showToast({ title: '已清空历史', icon: 'none' });
  }
});
