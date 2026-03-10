Page({
  data: {
    name: '',
    category: '上装',
    colors: [
      { hex: '#D4C4B7' },
      { hex: '#FFFFFF' },
      { hex: '#1A1A1A' }
    ],
    currImage: '',
    currFileID: '',
    activeColor: 0,
    // 自定义拾色器相关
    colorPickerVisible: false,
    tempColor: '#FFFFFF',
    tempR: 255,
    tempG: 255,
    tempB: 255,
    seasons: [
      { name: '🌸 春季', active: false },
      { name: '🌞 夏季', active: false },
      { name: '🍂 秋季', active: false },
      { name: '❄️ 冬季', active: false }
    ],
    occasions: [
      { name: '💼 职场通勤', active: false },
      { name: '🥂 约会晚宴', active: false },
      { name: '☕ 周末休闲', active: false },
      { name: '📷 逛街拍照', active: false },
      { name: '✈️ 旅行度假', active: false },
      { name: '🏃 运动出汗', active: false },
      { name: '🎉 聚会派对', active: false },
      { name: '🛏 居家睡衣', active: false },
      { name: '🏫 校园上课', active: false }
    ],
  },

  onLoad(res) {
    console.log(res)
    this.setData({ currImage: res.path })
  },

  goBack() {
    wx.navigateBack();
  },

  async saveItem() {
    // 调用云函数，把 fileID 和其他属性存入数据库
    const that = this
    const dbRes = await wx.cloud.callFunction({
      name: 'clothFunctions',
      data: {
        type: 'addCloth',
        data: {
          fileID: 'test',//  that.data.currFileID,
          name: '我的新外套',
          category: '外套',
          tags: ['休闲', '春季'],
          color: '卡其色'
        }
      }
    });
    if (dbRes.result.success) {
      wx.showToast({ title: '添加成功！', icon: 'success', duration: 1500 });
      // 这里可以跳转回列表页或者刷新数据
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
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
              wx.editImage({
                src: tempFilePath, // 图片路径
                success: (res) => {
                  that.setData({ currImage: res.tempFilePath})
                }
              })
            },
          });
        } else if (res.tapIndex === 1) {
          wx.chooseMessageFile({
            count: 10,
            type: "image",
            success(res) {
              // tempFilePath可以作为img标签的src属性显示图片
              const [tempFilePaths] = res.tempFiles;
              wx.editImage({
                src: tempFilePaths.path, // 图片路径
                success: (res) => {
                  that.setData({ currImage: res.tempFilePath})
                }
              })
            },
          });
        }
      }
    });
  },

  selectCategory() {
    wx.showActionSheet({
      itemList: ["上装", "下装", "连衣裙", "鞋履", "配饰"],
      success: (res) => {
        const list = ["上装", "下装", "连衣裙", "鞋履", "配饰"];
        this.setData({ category: list[res.tapIndex] });
      }
    });
  },

  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  switchColor(e) {
    this.setData({ activeColor: e.currentTarget.dataset.index });
  },

  addColor() {
    this.setData({
      colorPickerVisible: true
    });
  },

  // RGB 滑块变化
  onColorSliderChange(e) {
    const channel = e.currentTarget.dataset.channel; // 'r' | 'g' | 'b'
    const value = Number(e.detail.value);
    let { tempR, tempG, tempB } = this.data;

    if (channel === 'r') tempR = value;
    if (channel === 'g') tempG = value;
    if (channel === 'b') tempB = value;

    const toHex = (v) => {
      const h = v.toString(16).toUpperCase();
      return h.length === 1 ? '0' + h : h;
    };

    const tempColor = `#${toHex(tempR)}${toHex(tempG)}${toHex(tempB)}`;

    this.setData({
      tempR,
      tempG,
      tempB,
      tempColor
    });
  },

  // 取消拾色
  cancelColorPick() {
    this.setData({
      colorPickerVisible: false
    });
  },

  // 确认选择颜色
  confirmColorPick() {
    const hex = this.data.tempColor;
    const colors = this.data.colors.concat({ hex });
    this.setData({
      colors,
      activeColor: colors.length - 1,
      colorPickerVisible: false
    });
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
