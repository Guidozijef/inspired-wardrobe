Page({
  data: {
    tabs: ['👗 单品库', '🖼️ 杂志模板', '✨ 滤镜/去色'],
    activeTab: 0,
    libraryItems: ['🎽', '👔', '👗', '🩳', '👟', '🧥', '👖', '👠'],
    canvasItems: [
      { id: 1, emoji: '🧥', x: 80, y: 100, active: true },
      { id: 2, emoji: '👖', x: 100, y: 220, active: false }
    ],
    nextId: 3,
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

  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  },

  switchDrawerTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.index });
  },

  onItemChange(e) {
    if (e.detail.source === 'touch') {
      const id = e.currentTarget.dataset.id;
      const item = this.data.canvasItems.find(i => i.id === id);
      if (item) {
        item.x = e.detail.x;
        item.y = e.detail.y;
      }
    }
  },

  activateItem(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.data.canvasItems.map(item => ({
      ...item,
      active: item.id === id
    }));
    this.setData({ canvasItems: items });
  },

  removeItem(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.data.canvasItems.filter(item => item.id !== id);
    this.setData({ canvasItems: items });
  },

  addToCanvas(e) {
    const emoji = e.currentTarget.dataset.emoji;
    const newItem = {
      id: this.data.nextId,
      emoji: emoji,
      x: 120,
      y: 150,
      active: true
    };
    
    const items = this.data.canvasItems.map(item => ({...item, active: false}));
    items.push(newItem);
    
    this.setData({ 
      canvasItems: items,
      nextId: this.data.nextId + 1
    });
  },

  clearCanvas() {
    wx.showModal({
      title: '提示',
      content: '确定要清空画布吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ canvasItems: [] });
        }
      }
    });
  },

  saveCanvas() {
    wx.showToast({
      title: '已保存到穿搭',
      icon: 'success',
      duration: 1500
    });
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/looks/looks' });
    }, 1500);
  }
});
