import { takePhoto, chooseImage } from '../utils'

Page({
  data: {
    editingId: '',
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
    // 记录拾色画布在页面上的位置，用于触摸坐标换算
    pickerRect: null,
    // 当前图片是否已经完成抠图（避免重复抠图）
    hasCutout: false,
    // 当前选择点在圆形调色盘中的位置（用于小圆圈展示）
    pickerX: 110,
    pickerY: 80,
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

  async onLoad(options) {
    // 1. 新增：从首页「添加」进来，带本地图片 path
    if (options && options.path) {
      const localPath = decodeURIComponent(options.path);
      // 先显示原图，提升反馈，再自动触发一次抠图
      this.setData({ currImage: localPath });
      this.autoCutoutForNew(localPath);
    }

    // 2. 编辑：从首页卡片进来，带云数据库文档 id
    if (options && options.id) {
      const db = wx.cloud.database();
      try {
        wx.showLoading({ title: '加载中...', mask: true });
        const res = await db.collection('clothes').doc(options.id).get();
        const item = res.data;

        // 处理季节/场合多选状态
        const seasons = this.data.seasons.map(s => ({
          ...s,
          active:
            Array.isArray(item.seasons) &&
            item.seasons.includes(s.name),
        }));
        const occasions = this.data.occasions.map(o => ({
          ...o,
          active:
            Array.isArray(item.occasions) &&
            item.occasions.includes(o.name),
        }));

        // 颜色：用数据库里的主色作为当前主色
        const mainColor = item.color || '#FFFFFF';

        this.setData({
          editingId: options.id,
          name: item.name || '',
          category: item.category || '上装',
          currImage: item.image_url || '',
          currFileID: item.image_url || '',
          colors: [{ hex: mainColor }],
          activeColor: 0,
          seasons,
          occasions,
          hasCutout: true, // 从数据库来的图认为已完成抠图
        });
      } catch (e) {
        console.error('加载衣物详情失败', e);
        wx.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        wx.hideLoading();
      }
    }
  },

  onReady() {
    // 页面初次渲染完成时，准备好拾色画布信息
    this.initColorCanvas();
  },

  // 自动抠图核心逻辑：上传 -> 调用云函数抠图 -> [新增] 自动裁剪 -> 更新界面展示
  async processImageWithCutout(localPath) {
    if (!localPath) return;

    try {
      wx.showLoading({ title: 'AI 抠图中...', mask: true });
      
      // 1. 上传原图到临时目录
      const cloudPath = `temp/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: localPath
      });
      const originalFileID = uploadRes.fileID;

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

      const cutoutFileID = cutoutRes.result.fileID;

      // 3. [新增] 自动裁剪透明边界
      wx.showLoading({ title: '正在优化裁剪...', mask: true });
      const croppedFilePath = await this.autoCropImage(cutoutFileID);
      
      // 4. 上传裁剪后的图片
      const finalCloudPath = `clothes/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
      const finalUploadRes = await wx.cloud.uploadFile({
        cloudPath: finalCloudPath,
        filePath: croppedFilePath
      });
      const finalFileID = finalUploadRes.fileID;

      wx.hideLoading();

      // 5. 更新数据
      this.setData({
        currImage: finalFileID,
        currFileID: finalFileID,
        hasCutout: true
      });
    } catch (e) {
      console.error('AI 抠图或裁剪失败', e);
      const errorMsg = e.message || e.errMsg || '抠图失败，请重试';
      wx.showToast({ title: errorMsg, icon: 'none' });
      this.setData({
        currImage: localPath,
        hasCutout: false
      });
    } finally {
        wx.hideLoading();
    }
  },

  // 核心裁剪逻辑：利用 Canvas 获取非透明区域并裁剪
  async autoCropImage(fileID) {
    return new Promise((resolve, reject) => {
      // 1. 下载并获取图片信息
      wx.getImageInfo({
        src: fileID,
        success: (imgInfo) => {
          const query = wx.createSelectorQuery();
          query.select('#processCanvas').node().exec(async (res) => {
            if (!res[0] || !res[0].node) return reject(new Error('未找到处理画布'));
            
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const { width, height } = imgInfo;

            // 设置画布大小为原图大小
            canvas.width = width;
            canvas.height = height;

            const img = canvas.createImage();
            img.onload = () => {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);

              // 获取像素数据
              const imageData = ctx.getImageData(0, 0, width, height);
              const data = imageData.data;

              let minX = width, minY = height, maxX = 0, maxY = 0;
              let found = false;

              // 扫描非透明像素点
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  const alpha = data[(y * width + x) * 4 + 3];
                  if (alpha > 10) { // 稍微给点阈值过滤杂质
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                    found = true;
                  }
                }
              }

              if (!found) return resolve(imgInfo.path); // 如果全透明则返回原路径

              // 计算裁剪后的宽高
              const cropW = maxX - minX + 1;
              const cropH = maxY - minY + 1;

              // 创建一个新的临时画布进行裁剪后的绘制
              // 注意：直接复用此 canvas 即可，只需修改导出参数或重绘
              const offCanvas = wx.createOffscreenCanvas({ type: '2d', width: cropW, height: cropH });
              const offCtx = offCanvas.getContext('2d');
              offCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

              // 导出临时路径
              wx.canvasToTempFilePath({
                canvas: offCanvas,
                destWidth: cropW,
                destHeight: cropH,
                success: (res) => resolve(res.tempFilePath),
                fail: (err) => reject(err)
              });
            };
            img.onerror = (e) => reject(new Error('图片加载到画布失败'));
            img.src = imgInfo.path;
          });
        },
        fail: (err) => reject(new Error('获取图片信息失败'))
      });
    });
  },

  // 新增流程：从首页进来的自动处理
  async autoCutoutForNew(localPath) {
    await this.processImageWithCutout(localPath);
  },

  goBack() {
    wx.navigateBack();
  },

  async saveItem() {
    const { editingId, name, category, colors, activeColor, seasons, occasions, currImage, currFileID, hasCutout } = this.data;

    if (!currImage) {
      wx.showToast({ title: '请先上传图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '处理图片中...', mask: true });

    try {
      const isEdit = !!editingId;
      const finalFileID = currFileID;

      // 3. 提取选中的季节和场合
      const activeSeasons = seasons.filter(s => s.active).map(s => s.name);
      const activeOccasions = occasions.filter(o => o.active).map(o => o.name);
      const mainColor = colors[activeColor] ? colors[activeColor].hex : '';

      // 4. 保存单品信息（新增或更新）
      wx.showLoading({ title: '保存中...', mask: true });
      const dbRes = await wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: isEdit ? 'updateCloth' : 'addCloth',
          data: {
            // 编辑模式需要传 id，新增时后台会忽略
            id: editingId,
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
        wx.showToast({ title: isEdit ? '更新成功！' : '添加成功！', icon: 'success', duration: 1500 });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      } else {
        wx.showToast({ title: '添加失败：' + dbRes.result.errMsg, icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('保存单品失败:', err);
      wx.showToast({ title: (err.message || '系统错误'), icon: 'none' });
    }
  },

  // 重新上传
  reupload() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: async (res) => {
        let tempFilePath = '';
        try {
          if (res.tapIndex === 0) {
            tempFilePath = await takePhoto();
          } else if (res.tapIndex === 1) {
            tempFilePath = await chooseImage();
          }
          if (tempFilePath) {
            // 选完图直接进入抠图流程
            this.processImageWithCutout(tempFilePath);
          }
        } catch (e) {
          console.error('选择图片失败', e);
        }
      }
    });
  },

  selectCategory() {
    wx.showActionSheet({
      itemList: ["上装", "下装", "连衣裙", "包包", "鞋履", "配饰"],
      success: (res) => {
        const list = ["上装", "下装", "连衣裙", "包包", "鞋履", "配饰"];
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
    this.initColorCanvas();
  },

  // 初始化 Canvas 调色板
  initColorCanvas() {
    const query = wx.createSelectorQuery().in(this);
    query
      .select('#color-picker-canvas')
      .boundingClientRect(rect => {
        if (!rect) return;

        const ctx = wx.createCanvasContext('colorPickerCanvas', this);
        const width = rect.width;
        const height = rect.height;

        // 纯色相圆盘：先画完整的色相渐变，再由圆形裁剪，避免上下出现白边
        const hueGrad = ctx.createLinearGradient(0, 0, width, 0);
        hueGrad.addColorStop(0, 'red');
        hueGrad.addColorStop(1 / 6, 'yellow');
        hueGrad.addColorStop(2 / 6, 'lime');
        hueGrad.addColorStop(3 / 6, 'cyan');
        hueGrad.addColorStop(4 / 6, 'blue');
        hueGrad.addColorStop(5 / 6, 'magenta');
        hueGrad.addColorStop(1, 'red');
        ctx.setFillStyle(hueGrad);
        ctx.fillRect(0, 0, width, height);

        ctx.draw(false, () => {
          this.setData({ pickerRect: rect });
        });
      })
      .exec();
  },

  // 在调色板上拖动 / 点击，实时读取像素颜色
  onColorCanvasTouch(e) {
    const rect = this.data.pickerRect;
    if (!rect) return;

    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;

    // 在 2D Canvas 下，touch.x / touch.y 已经是相对 canvas 的坐标，
    // 这里不再减去 rect.left / top，避免坐标错乱导致颜色不更新。
    let x = touch.x;
    let y = touch.y;

    x = Math.max(0, Math.min(rect.width - 1, x));
    y = Math.max(0, Math.min(rect.height - 1, y));

    wx.canvasGetImageData({
      canvasId: 'colorPickerCanvas',
      x: Math.round(x),
      y: Math.round(y),
      width: 1,
      height: 1,
      success: (res) => {
        const [r, g, b] = res.data;
        const toHex = (v) => {
          const h = v.toString(16).toUpperCase();
          return h.length === 1 ? '0' + h : h;
        };
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        this.setData({
          tempColor: hex,
          // 让小圆圈中心落在当前触摸点
          pickerX: x - 6,
          pickerY: y - 6
        });
      }
    }, this);
  },

  // 阻止弹窗区域的触摸事件滚动到底层页面，保证纵向拖动生效
  stopTouchMove() {
    return false;
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
