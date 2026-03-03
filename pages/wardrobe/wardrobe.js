Page({
  data: {
    showAction: false,
    categories: ['全部', '上装', '下装', '连衣裙', '鞋履', '配饰'],
    activeCategory: 0,
    items: [
      { emoji: '👚', title: '基础白衬衫', desc: '上装 · 春夏', tag: '职场' },
      { emoji: '👖', title: '直筒牛仔裤', desc: '下装 · 四季', tag: '' },
      { emoji: '👗', title: '法式碎花裙', desc: '连衣裙 · 约会', tag: '' },
      { emoji: '👠', title: '复古红高跟', desc: '鞋履 · 职场', tag: '' }
    ],
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

  switchCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.index });
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  goToDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({ 
      url: `/pages/detail/detail?title=${item.title}&emoji=${item.emoji}&desc=${item.desc}` 
    });
  },

  showActionSheet() {
    this.setData({ showAction: true });
  },
  
  hideActionSheet() {
    this.setData({ showAction: false });
  },
  
  stopProp() {
    // Prevent event bubbling
  },
  
  goToEdit() {
    this.hideActionSheet();
    wx.navigateTo({
      url: '/pages/edit/edit'
    });
  },
  
  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({
      url: path
    });
  }
});
