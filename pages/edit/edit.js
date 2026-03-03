Page({
  data: {
    category: '外套 / 风衣',
    colors: [
      { hex: '#D4C4B7' },
      { hex: '#FFFFFF' },
      { hex: '#1A1A1A' }
    ],
    activeColor: 0,
    seasons: [
      { name: '🌸 春季', active: false },
      { name: '🍂 秋季', active: true },
      { name: '❄️ 冬季', active: false }
    ],
    occasions: [
      { name: '💼 职场通勤', active: true },
      { name: '🥂 约会晚宴', active: false },
      { name: '✈️ 旅行度假', active: true }
    ],
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

  saveItem() {
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  reupload() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        wx.showToast({ title: '模拟上传成功', icon: 'none' });
      }
    });
  },

  selectCategory() {
    wx.showActionSheet({
      itemList: ['外套 / 风衣', '上装 / 衬衫', '下装 / 裤子', '连衣裙'],
      success: (res) => {
        const list = ['外套 / 风衣', '上装 / 衬衫', '下装 / 裤子', '连衣裙'];
        this.setData({ category: list[res.tapIndex] });
      }
    });
  },

  switchColor(e) {
    this.setData({ activeColor: e.currentTarget.dataset.index });
  },

  addColor() {
    wx.showToast({ title: '打开拾色器', icon: 'none' });
  },

  toggleSeason(e) {
    const index = e.currentTarget.dataset.index;
    const seasons = this.data.seasons;
    seasons[index].active = !seasons[index].active;
    this.setData({ seasons });
  },

  toggleOccasion(e) {
    const index = e.currentTarget.dataset.index;
    const occasions = this.data.occasions;
    occasions[index].active = !occasions[index].active;
    this.setData({ occasions });
  }
});
