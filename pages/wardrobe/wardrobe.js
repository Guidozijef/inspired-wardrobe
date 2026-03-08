Page({
  data: {
    showAction: false,
    categories: ["全部", "上装", "下装", "连衣裙", "鞋履", "配饰"],
    activeCategory: 0,
    items: [
      { emoji: "👚", title: "基础白衬衫", desc: "上装 · 春夏", tag: "职场" },
      { emoji: "👖", title: "直筒牛仔裤", desc: "下装 · 四季", tag: "" },
      { emoji: "👗", title: "法式碎花裙", desc: "连衣裙 · 约会", tag: "" },
      { emoji: "👠", title: "复古红高跟", desc: "鞋履 · 职场", tag: "" },
    ],
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
  },

  switchCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.index });
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

  goToEdit(path) {
    wx.navigateTo({
      url: "/pages/edit/edit?path=" + path,
    });
  },

  // 相册
  goPhotoalbum() {
    const that = this;
    that.hideActionSheet();
    wx.chooseMessageFile({
      count: 10,
      type: "image",
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const [tempFilePaths] = res.tempFiles;
        wx.editImage({
          src: tempFilePaths.path, // 图片路径
          success: (res) => {
            that.goToEdit(res.tempFilePath)
          }
        })
      },
    });
  },

  // 拍照
  goPhotograph() {
    this.hideActionSheet();
    const that = this;
    wx.chooseMedia({
      count: 1, // 仅拍摄一张
      mediaType: ["image"],
      sourceType: ["camera"], // 仅调用相机
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 接下来将照片上传到服务器或进行预览
        wx.editImage({
          src: tempFilePath, // 图片路径
          success: (res) => {
            that.goToEdit(res.tempFilePath)
          }
        })
      },
    });
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
