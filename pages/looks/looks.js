Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    looks: [
      { id: 1, title: '职场通勤', date: '2026-02-26', emoji: '🧥👖', bg: '#F3E8FF' },
      { id: 2, title: '约会晚宴', date: '2026-02-25', emoji: '👗👠', bg: '#FFE4E6' },
      { id: 3, title: '周末运动', date: '2026-02-20', emoji: '🎽👟', bg: '#E0F2FE' },
      { id: 4, title: '休闲日常', date: '2026-02-18', emoji: '👕🩳', bg: '#DCFCE7' }
    ]
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
  },
  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/look_detail/look_detail?id=${id}` });
  }
});
