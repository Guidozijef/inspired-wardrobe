Page({
  data: {
    tabs: ['👗 单品库', '🖼️ 杂志模板', '✨ 滤镜/去色'],
    activeTab: 0,
    categories: ["全部", "上装", "下装", "连衣裙", "鞋履", "配饰"],
    activeCategory: 0,
    allItems: [], // 存储从云端获取的所有单品
    libraryItems: [], // 存储当前分类下的单品
    canvasItems: [],
    nextId: 1,
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
    this.fetchClothes();
  },

  onShow() {
    this.fetchClothes();
  },

  fetchClothes() {
    const db = wx.cloud.database();
    db.collection('clothes').get().then(res => {
      this.setData({
        allItems: res.data || []
      }, () => {
        this.applyCategoryFilter();
      });
    }).catch(err => {
      console.error('获取单品失败', err);
    });
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeCategory: index }, () => {
      this.applyCategoryFilter();
    });
  },

  applyCategoryFilter() {
    const { activeCategory, categories, allItems } = this.data;
    const currentCategory = categories[activeCategory];
    
    if (currentCategory === '全部') {
      this.setData({ libraryItems: allItems });
    } else {
      const filtered = allItems.filter(item => item.category === currentCategory);
      this.setData({ libraryItems: filtered });
    }
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
    const item = e.currentTarget.dataset.item;
    const newItem = {
      id: this.data.nextId,
      url: item.image_url,
      x: 100,
      y: 100,
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
