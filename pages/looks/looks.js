Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    looks: [
      { id: 1, title: '职场通勤', date: '2026-02-26', emoji: '🧥👖', bg: '#F3E8FF' },
      { id: 2, title: '约会晚宴', date: '2026-02-25', emoji: '👗👠', bg: '#FFE4E6' },
      { id: 3, title: '周末运动', date: '2026-02-20', emoji: '🎽👟', bg: '#E0F2FE' },
      { id: 4, title: '休闲日常', date: '2026-02-18', emoji: '👕🩳', bg: '#DCFCE7' }
    ],
    colors: ['#F3E8FF', '#FFE4E6','#E0F2FE', '#DCFCE7']
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
    this.fetchLooks();
  },
  onShow() {
    this.fetchLooks();
  },
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  fetchLooks() {
    wx.showLoading({ title: '加载中...', mask: true });
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { type: 'getOutfits' }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        this.setData({
          looks: res.result.data.map(item => ({
            id: item._id,
            title: item.title || '我的搭配',
            date: this.formatDate(item.create_time),
            emoji: '🧥👖', // 暂用
            bg: this.data.colors[this.getRandomNumber(0,3)],
            preview: item.preview_url || ''
          }))
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取搭配失败', err);
    });
  },
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },
  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/look_detail/look_detail?id=${id}` });
  }
});
