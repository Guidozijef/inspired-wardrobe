Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    look: {
      id: 1,
      title: '职场通勤',
      date: '2026-02-26',
      emoji: '🧥👖',
      bg: '#F3E8FF',
      items: ['🧥 基础白衬衫', '👖 直筒西装裤']
    }
  },
  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
    // In a real app, fetch look details using options.id
  },
  goBack() {
    wx.navigateBack();
  },
  shareImage() {
    wx.showToast({
      title: '已生成分享图',
      icon: 'success'
    });
  },
  editLook() {
    // Navigate back to canvas with this look's data
    wx.redirectTo({ url: '/pages/canvas/canvas' });
  }
});
