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
    const { name, category, colors, activeColor, seasons, occasions, currImage, currFileID } = this.data;

    if (!currImage) {
      wx.showToast({ title: '请先上传图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: 'AI 抠图中...', mask: true });

    try {
      let originalFileID = currFileID;

      // 1. 如果是本地临时路径，则需要先上传原始图
      const cloudPath = `temp/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: currImage
      });
      originalFileID = uploadRes.fileID;

      // 2. 调用抠图云函数
      const cutoutRes = await wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: 'doCutout',
          data: { fileID: originalFileID }
        }
      });

      if (!cutoutRes.result.success) {
        throw new Error(cutoutRes.result.errMsg || '抠图失败');
      }

      const finalFileID = cutoutRes.result.fileID;

      // 3. 提取选中的季节和场合
      const activeSeasons = seasons.filter(s => s.active).map(s => s.name);
      const activeOccasions = occasions.filter(o => o.active).map(o => o.name);
      const mainColor = colors[activeColor] ? colors[activeColor].hex : '';

      // 4. 保存单品信息
      wx.showLoading({ title: '保存中...', mask: true });
      const dbRes = await wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: 'addCloth',
          data: {
            fileID: finalFileID,
            name: name || '未命名衣物',
            category,
            seasons: activeSeasons,
            occasions: activeOccasions,
            color: mainColor
          }
        }
      });

      wx.hideLoading();

      if (dbRes.result.success) {
        wx.showToast({ title: '添加成功！', icon: 'success', duration: 1500 });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: '添加失败：' + dbRes.result.errMsg, icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('保存单品失败:', err);
      wx.showToast({ title: (err.message || '系统错误'), icon: 'none' });
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
              // wx.editImage({
              //   src: tempFilePath, // 图片路径
              //   success: (res) => {
                  that.setData({ currImage: tempFilePath})
                // }
              // })
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
