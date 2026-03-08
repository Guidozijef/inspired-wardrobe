Page({
  data: {
    category: '外套 / 风衣',
    colors: [
      { hex: '#D4C4B7' },
      { hex: '#FFFFFF' },
      { hex: '#1A1A1A' }
    ],
    currImage: '',
    activeColor: 0,
    seasons: [
      { name: '🌸 春季', active: false },
      { name: '🌞 夏季', active: false },
      { name: '🍂 秋季', active: true },
      { name: '❄️ 冬季', active: false }
    ],
    occasions: [
      { name: '💼 职场通勤', active: true },
      { name: '🥂 约会晚宴', active: false },
      { name: '✈️ 旅行度假', active: true }
    ],
  },

  onLoad(res) {
    console.log(res)
    this.setData({ currImage: res.path })
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
    const that = this
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.chooseMedia({
            count: 1, // 仅拍摄一张
            mediaType: ["image"],
            sourceType: ["camera"], // 仅调用相机
            success: (res) => {
              const tempFilePath = res.tempFiles[0].tempFilePath;
              that.setData({ currImage: tempFilePath})
            },
          });
        } else if (res.tapIndex === 1) {
          wx.chooseMessageFile({
            count: 10,
            type: "image",
            success(res) {
              // tempFilePath可以作为img标签的src属性显示图片
              const [tempFilePaths] = res.tempFiles;
              that.setData({ currImage: tempFilePaths.path})
            },
          });
        }
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
