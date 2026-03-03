Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    menuButtonWidth: 80
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height,
      menuButtonWidth: sysInfo.windowWidth - menuButton.left + 10
    });
  },
  goBack() {
    wx.navigateBack();
  },
  chooseCover() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        wx.showToast({ title: '已选择封面', icon: 'success' });
      }
    });
  },
  addItems() {
    wx.showToast({ title: '打开衣橱选择单品', icon: 'none' });
  },
  saveCapsule() {
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1500);
  }
});
