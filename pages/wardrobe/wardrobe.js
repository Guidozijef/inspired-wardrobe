import { takePhoto, chooseImage } from '../utils'
import { WARDROBE_CATEGORIES } from '../constants'

Page({
  data: {
    showAction: false,
    categories: WARDROBE_CATEGORIES,
    activeCategory: 0,
    items: [],
    statusBarHeight: 20,
    navBarHeight: 44,
    page: 0,
    pageSize: 10,
    isLoading: false,
    isNoMore: false
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height,
    });
  },

  onShow() {
    this.resetAndFetch();
  },

  resetAndFetch() {
    this.setData({
      page: 0,
      items: [],
      isNoMore: false,
      isLoading: false
    }, () => {
      this.fetchClothes();
    });
  },

  fetchClothes() {
    if (this.data.isLoading || this.data.isNoMore) return;

    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中...', mask: true });

    const currentCategory = this.data.categories[this.data.activeCategory];

    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: {
        type: 'getClothes',
        data: {
          category: currentCategory,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      }
    })
      .then(res => {
        wx.hideLoading();
        this.setData({ isLoading: false });

        if (res.result && res.result.success) {
          const rawList = res.result.data || [];
          const isNoMore = rawList.length < this.data.pageSize;

          const newItems = rawList.map(item => {
            const originalSeasons = Array.isArray(item.seasons) ? item.seasons : [];
            const seasonIcons = originalSeasons.map(s => {
              const match = s.match(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\uFE00-\uFE0F]+/g);
              return match ? match[0] : '';
            }).filter(icon => icon !== '');

            return {
              id: item._id,
              category: item.category || '',
              emoji: item.image_url || '',
              title: item.name || '未命名单品',
              desc: item.category || '',
              seasons: seasonIcons,
              tag: Array.isArray(item.occasions) && item.occasions.length ? item.occasions[0] : '',
            };
          });

          this.setData({
            items: [...this.data.items, ...newItems],
            page: this.data.page + 1,
            isNoMore: isNoMore
          });
        }
      })
      .catch(err => {
        this.setData({ isLoading: false });
        wx.hideLoading();
        console.error('获取 clothes 数据失败', err);
      });
  },

  onReachBottom() {
    this.fetchClothes();
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.activeCategory === index) return;
    this.setData({ activeCategory: index }, () => {
      this.resetAndFetch();
    });
  },

  goToSearch() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  goToEdit(eOrPath) {
    let path = '';
    let id = '';

    if (typeof eOrPath === 'string') {
      path = eOrPath;
    } else if (eOrPath && eOrPath.currentTarget) {
      const item = eOrPath.currentTarget.dataset.item || {};
      id = item.id || '';
    }

    let url = '/pages/edit/edit';
    const query = [];
    if (path) query.push('path=' + encodeURIComponent(path));
    if (id) query.push('id=' + id);
    if (query.length) {
      url += '?' + query.join('&');
    }

    wx.navigateTo({ url });
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

  async goPhotoalbum() {
    this.hideActionSheet();
    try {
      const filePath = await chooseImage();
      this.goToEdit(filePath);
    } catch (e) {
      console.error('从相册选择失败', e);
    }
  },

  async goPhotograph() {
    this.hideActionSheet();
    try {
      const filePath = await takePhoto();
      this.goToEdit(filePath);
    } catch (e) {
      console.error('拍照失败', e);
    }
  },

  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({
      url: path,
    });
  },
});
