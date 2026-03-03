Page({
  data: {
    title: '基础白衬衫',
    emoji: '👚',
    desc: '上装 · 春夏',
    statusBarHeight: 20,
    navBarHeight: 44,
    menuButtonWidth: 80
  },
  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const updateData = {
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height,
      menuButtonWidth: sysInfo.windowWidth - menuButton.left + 10
    };
    if (options.title) {
      updateData.title = options.title;
      updateData.emoji = options.emoji;
      updateData.desc = options.desc;
    }
    this.setData(updateData);
  },
  goBack() {
    wx.navigateBack();
  },
  editItem() {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },
  deleteItem() {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这件单品吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        }
      }
    });
  }
});
