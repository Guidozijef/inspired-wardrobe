Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    looks: [],
    colors: ['#F3E8FF', '#FFE4E6','#E0F2FE', '#DCFCE7'],
    page: 0,
    pageSize: 10, // 调整为每次加载 10 条
    isLoading: false,
    isNoMore: false,
    loadedImages: {}
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
    // onLoad 不再主动 fetch，由 onShow 统一处理
  },
  onShow() {
    this.resetAndFetch();
  },
  resetAndFetch() {
    this.setData({
      page: 0,
      looks: [],
      isNoMore: false,
      isLoading: false
    }, () => {
      this.fetchLooks();
    });
  },
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  fetchLooks() {
    if (this.data.isLoading || this.data.isNoMore) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中...', mask: true });
    
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { 
        type: 'getOutfits',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      }
    }).then(res => {
      wx.hideLoading();
      this.setData({ isLoading: false });
      
      if (res.result && res.result.success) {
        const newData = res.result.data || [];
        const isNoMore = newData.length < this.data.pageSize;
        
        const newLooks = newData.map(item => ({
          id: item._id,
          title: item.title || '我的搭配',
          date: this.formatDate(item.record_date || item.create_time),
          emoji: '🧥👖', 
          bg: this.data.colors[this.getRandomNumber(0,3)],
          preview: item.preview_url || ''
        }));

        this.setData({
          looks: [...this.data.looks, ...newLooks],
          page: this.data.page + 1,
          isNoMore: isNoMore
        });
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isLoading: false });
      console.error('获取搭配失败', err);
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.fetchLooks();
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
  onImageLoad(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      this.setData({ [`loadedImages.${id}`]: true });
    }
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/look_detail/look_detail?id=${id}` });
  }
});
