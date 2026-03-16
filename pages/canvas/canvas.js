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
      const index = this.data.canvasItems.findIndex(i => i.id === id);
      if (index !== -1) {
        // 直接修改数据而不通过 setData，避免与组件内部状态产生死循环冲突
        // 这样可以解决位置跳变和抖动问题
        this.data.canvasItems[index].x = e.detail.x;
        this.data.canvasItems[index].y = e.detail.y;
      }
    }
  },

  onItemScale(e) {
    const id = e.currentTarget.dataset.id;
    const index = this.data.canvasItems.findIndex(i => i.id === id);
    if (index !== -1) {
      // 记录缩放比例，不使用 setData 避免缩放爆炸
      this.data.canvasItems[index].scale = e.detail.scale;
    }
  },

  activateItem(e) {
    const id = e.currentTarget.dataset.id;
    const { canvasItems } = this.data;
    
    // 找出当前激活的项是否就是被点击的项
    const currentActiveItem = canvasItems.find(i => i.active);
    if (currentActiveItem && currentActiveItem.id === id) return;

    const updates = {};
    let maxZ = 0;
    canvasItems.forEach(item => {
      if (item.zIndex > maxZ) maxZ = item.zIndex;
    });

    canvasItems.forEach((item, index) => {
      const activePath = `canvasItems[${index}].active`;
      const zIndexPath = `canvasItems[${index}].zIndex`;
      const xPath = `canvasItems[${index}].x`;
      const yPath = `canvasItems[${index}].y`;
      const scalePath = `canvasItems[${index}].scale`;
      
      if (item.id === id) {
        updates[activePath] = true;
        updates[zIndexPath] = maxZ + 1;
      } else if (item.active) {
        updates[activePath] = false;
        // 在切换前，将之前静默修改的位置和缩放同步到渲染层
        updates[xPath] = item.x;
        updates[yPath] = item.y;
        updates[scalePath] = item.scale;
      }
    });

    this.setData(updates);
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
      active: true,
      scale: 1,
      zIndex: Math.max(...this.data.canvasItems.map(i => i.zIndex || 0), 0) + 1
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
