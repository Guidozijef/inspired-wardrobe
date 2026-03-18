import { takePhoto, chooseImage } from '../utils'

Page({
  data: {
    showAction: false,
    categories: ["全部", "上装", "下装", "连衣裙", "包包", "鞋履", "配饰"],
    activeCategory: 0,
    // 从云数据库 clothes 拉取的完整衣服列表
    allItems: [],
    // 根据当前筛选展示的列表
    items: [],
    statusBarHeight: 20,
    navBarHeight: 44,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight:
        (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height,
    });

    // 首次进入页面时也拉取一次
    this.fetchClothes();
  },

  // 从编辑页返回时会触发 onShow，这里重新拉取一次云端数据
  onShow() {
    this.fetchClothes();
  },

  // 从云端获取数据
  fetchClothes() {
    wx.showLoading({ title: '加载中...', mask: true });
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: {
        type: 'getClothes'
      }
    })
      .then(res => {
        wx.hideLoading()
        const list = (res.result.data || []).map(item => {
          // 你的 clothes 文档字段结构：
          // category: "上装"
          // image_url: "cloud://..."
          // name: "222"
          // occasions: ["🥂 约会晚宴"]
          // seasons: ["🌞 夏季", "🍂 秋季"]
          const category = item.category || '';
          const originalSeasons = Array.isArray(item.seasons) ? item.seasons : [];
          
          // 提取季节图标（如 🌸, 🌞, 🍂, ❄️）
          const seasonIcons = originalSeasons.map(s => {
            const match = s.match(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g);
            return match ? match[0] : '';
          }).filter(icon => icon !== '');

          return {
            id: item._id,
            category: category,
            emoji: item.image_url || '',
            title: item.name || '未命名单品',
            // description 只保留分类，季节通过图标展示
            desc: category,
            seasons: seasonIcons,
            tag:
              Array.isArray(item.occasions) && item.occasions.length
                ? item.occasions[0]
                : '',
          };
        });

        // 默认按照当前选中的 tab 做一次筛选（如“全部”）
        this.setData(
          {
            allItems: list,
          },
          () => {
            this.applyCategoryFilter();
          }
        );
      })
      .catch(err => {
        console.error('获取 clothes 数据失败', err);
        wx.showToast({
          title: '衣橱加载失败',
          icon: 'none',
        });
      });
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index;
    this.setData(
      { activeCategory: index },
      () => {
        this.applyCategoryFilter();
      }
    );
  },

  // 根据当前 activeCategory 对 allItems 做筛选
  applyCategoryFilter() {
    const { activeCategory, categories, allItems } = this.data;
    const current = categories[activeCategory];

    if (!current || current === '全部') {
      this.setData({ items: allItems });
      return;
    }

    const filtered = allItems.filter(item => item.category === current);
    this.setData({ items: filtered });
  },

  goToSearch() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  goToDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/detail/detail?title=${item.title}&emoji=${item.emoji}&desc=${item.desc}`,
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

  // 进入编辑页：
  // 1）从首页卡片点击：传入 event，携带已有单品 id
  // 2）从拍照/相册新增：传入图片本地 path
  goToEdit(eOrPath) {
    let path = '';
    let id = '';

    if (typeof eOrPath === 'string') {
      // 新增：直接传入本地图片地址
      path = eOrPath;
    } else if (eOrPath && eOrPath.currentTarget) {
      // 首页点击已有单品
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

  // 相册
  async goPhotoalbum() {
    this.hideActionSheet();
    try {
      const filePath = await chooseImage();
      this.goToEdit(filePath);
    } catch (e) {
      console.error('从相册选择失败', e);
    }
  },

  // 拍照
  async goPhotograph() {
    this.hideActionSheet();
    try {
      const filePath = await takePhoto();
      this.goToEdit(filePath);
    } catch (e) {
      console.error('拍照失败', e);
    }
  },


  addData(path) {
    let newList = that.data.items;
    let newObj = {
      emoji: path,
      title: "基础白衬衫",
      desc: "上装 · 春夏",
      tag: "职场",
    };
    newList.push(newObj); // JS数组操作
    that.setData({
      items: newList, // 更新视图
    });
  },

  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({
      url: path,
    });
  },
});
