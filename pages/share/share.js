Page({
  data: {
    look: {},
    backgrounds: [
      { id: 'bg1', type: 'solid', value: '#F2F2F7', css: '#F2F2F7' },
      { id: 'bg2', type: 'solid', value: '#FFFFFF', css: '#FFFFFF' },
      { id: 'bg3', type: 'solid', value: '#FFE5E5', css: '#FFE5E5' },
      { id: 'bg4', type: 'solid', value: '#E5F3FF', css: '#E5F3FF' },
      { id: 'bg5', type: 'solid', value: '#E8FFE5', css: '#E8FFE5' },
      { id: 'bg6', type: 'solid', value: '#FFF5E5', css: '#FFF5E5' },
      { id: 'bg7', type: 'solid', value: '#F3E5FF', css: '#F3E5FF' },
      { id: 'bg8', type: 'solid', value: '#000000', css: '#000000' },
      { id: 'grad1', type: 'gradient', colors: ['#a18cd1', '#fbc2eb'], css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
      { id: 'grad2', type: 'gradient', colors: ['#ff9a9e', '#fecfef'], css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
      { id: 'grad3', type: 'gradient', colors: ['#84fab0', '#8fd3f4'], css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
      { id: 'grad4', type: 'gradient', colors: ['#fccb90', '#d57eeb'], css: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
      { id: 'grad5', type: 'gradient', colors: ['#e0c3fc', '#8ec5fc'], css: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }
    ],
    selectedBg: { id: 'bg1', type: 'solid', value: '#F2F2F7', css: '#F2F2F7' },
    textColors: ['#333333', '#FFFFFF', '#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE', '#FFCC00', '#8E8E93'],
    inputText: '',
    textItems: [],
    nextTextId: 1,
    activeTextId: null,
    // 用于拖拽计算的变量
    dragInfo: {
      id: null,
      startX: 0,
      startY: 0,
      initX: 0,
      initY: 0
    }
  },

  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id);
    }
  },

  fetchDetail(id) {
    wx.showLoading({ title: '加载中...', mask: true });
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: {
        type: 'getOutfitDetail',
        data: { id: id }
      }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        const data = res.result.data;
        const initialBgColor = data.canvas_data ? data.canvas_data.background_color : '#F2F2F7';
        
        let backgrounds = this.data.backgrounds;
        let selectedBg = backgrounds.find(bg => bg.value === initialBgColor);
        
        if (!selectedBg) {
          selectedBg = { id: 'bg_custom', type: 'solid', value: initialBgColor, css: initialBgColor };
          backgrounds.unshift(selectedBg);
        }

        this.setData({
          look: data,
          selectedBg: selectedBg,
          backgrounds: backgrounds
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取搭配详情失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  goBack() {
    wx.navigateBack();
  },

  selectBg(e) {
    const bg = e.currentTarget.dataset.bg;
    this.setData({ selectedBg: bg });
  },

  onTextInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  addText() {
    const text = this.data.inputText.trim();
    if (!text) return;

    wx.createSelectorQuery().select('.canvas-area').boundingClientRect(rect => {
      const centerX = (rect ? rect.width / 2 : 150) - 40;
      const centerY = (rect ? rect.height / 2 : 200) - 20;

      const newItem = {
        id: this.data.nextTextId,
        content: text,
        x: centerX,
        y: centerY,
        size: 24,
        color: '#333333',
        active: true
      };

      const updatedItems = this.data.textItems.map(item => ({ ...item, active: false }));
      updatedItems.push(newItem);

      this.setData({
        textItems: updatedItems,
        nextTextId: this.data.nextTextId + 1,
        inputText: '',
        activeTextId: newItem.id
      });
    }).exec();
  },

  activateText(e) {
    const id = e.currentTarget.dataset.id;
    const updatedItems = this.data.textItems.map(item => ({
      ...item,
      active: item.id === id
    }));
    this.setData({ textItems: updatedItems, activeTextId: id });
  },

  deselectText() {
    const updatedItems = this.data.textItems.map(item => ({ ...item, active: false }));
    this.setData({ textItems: updatedItems, activeTextId: null });
  },

  cancelTextEdit() {
    this.deselectText();
  },

  deleteText(e) {
    const id = e.currentTarget.dataset.id;
    const updatedItems = this.data.textItems.filter(item => item.id !== id);
    this.setData({ 
      textItems: updatedItems,
      activeTextId: this.data.activeTextId === id ? null : this.data.activeTextId 
    });
  },

  changeTextColor(e) {
    const color = e.currentTarget.dataset.color;
    const { activeTextId, textItems } = this.data;
    if (!activeTextId) return;

    const index = textItems.findIndex(i => i.id === activeTextId);
    if (index !== -1) {
      this.setData({
        [`textItems[${index}].color`]: color
      });
    }
  },

  changeTextSize(e) {
    const size = e.detail.value;
    const { activeTextId, textItems } = this.data;
    if (!activeTextId) return;

    const index = textItems.findIndex(i => i.id === activeTextId);
    if (index !== -1) {
      this.setData({
        [`textItems[${index}].size`]: size
      });
    }
  },

  // 拖拽逻辑
  onTextTouchStart(e) {
    const id = e.currentTarget.dataset.id;
    const touch = e.touches[0];
    const item = this.data.textItems.find(i => i.id === id);
    
    if (!item.active) {
       this.activateText(e);
    }
    
    this.data.dragInfo = {
      id: id,
      startX: touch.clientX,
      startY: touch.clientY,
      initX: item.x,
      initY: item.y
    };
  },

  onTextTouchMove(e) {
    const dragInfo = this.data.dragInfo;
    if (!dragInfo.id) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragInfo.startX;
    const deltaY = touch.clientY - dragInfo.startY;

    const newX = dragInfo.initX + deltaX;
    const newY = dragInfo.initY + deltaY;

    const index = this.data.textItems.findIndex(i => i.id === dragInfo.id);
    if (index !== -1) {
      this.setData({
        [`textItems[${index}].x`]: newX,
        [`textItems[${index}].y`]: newY
      });
    }
  },

  async saveImage() {
    this.deselectText();

    wx.showLoading({ title: '正在生成海报...', mask: true });

    try {
      const tempFilePath = await this.generateCanvasImage();
      
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          wx.hideLoading();
          wx.showToast({ title: '已保存到相册', icon: 'success' });
        },
        fail: (err) => {
          wx.hideLoading();
          if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
            wx.showModal({
              title: '提示',
              content: '需要您授权保存相册',
              showCancel: true,
              success: modalRes => {
                if (modalRes.confirm) {
                  wx.openSetting();
                }
              }
            });
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' });
          }
        }
      });
    } catch (err) {
      wx.hideLoading();
      console.error('生成图片失败', err);
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
  },

  generateCanvasImage() {
    return new Promise((resolve, reject) => {
      const areaQuery = wx.createSelectorQuery();
      areaQuery.select('.canvas-area').boundingClientRect();
      
      areaQuery.exec(async (rects) => {
        const areaRect = rects[0];
        if (!areaRect) return reject(new Error('无法获取画板尺寸'));
        
        const width = areaRect.width;
        const height = areaRect.height;

        const canvasQuery = wx.createSelectorQuery();
        canvasQuery.select('#exportCanvas').node().exec(async (res) => {
          if (!res[0] || !res[0].node) return reject(new Error('未找到 Canvas 节点'));
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;

          const exportScale = 2; // 放大 2 倍
          canvas.width = width * dpr * exportScale;
          canvas.height = height * dpr * exportScale;
          
          ctx.scale(dpr * exportScale, dpr * exportScale);

          // 1. 绘制背景
          const bg = this.data.selectedBg;
          if (bg.type === 'gradient') {
            const grd = ctx.createLinearGradient(0, 0, width, height);
            grd.addColorStop(0, bg.colors[0]);
            grd.addColorStop(1, bg.colors[1]);
            ctx.fillStyle = grd;
          } else {
            ctx.fillStyle = bg.value;
          }
          ctx.fillRect(0, 0, width, height);

          // 2. 绘制穿搭预览图
          if (this.data.look.preview_url) {
            try {
              const info = await new Promise((resImg) => {
                wx.getImageInfo({
                  src: this.data.look.preview_url,
                  success: resImg,
                  fail: () => resImg(null)
                });
              });

              if (info && info.path) {
                const img = canvas.createImage();
                await new Promise((resLoad) => {
                  img.onload = resLoad;
                  img.src = info.path;
                });
                
                const imgRatio = info.width / info.height;
                const areaRatio = width / height;
                let drawW, drawH, drawX, drawY;

                if (imgRatio > areaRatio) {
                  drawW = width;
                  drawH = width / imgRatio;
                  drawX = 0;
                  drawY = (height - drawH) / 2;
                } else {
                  drawH = height;
                  drawW = height * imgRatio;
                  drawY = 0;
                  drawX = (width - drawW) / 2;
                }

                ctx.drawImage(img, drawX, drawY, drawW, drawH);
              }
            } catch (imgErr) {
              console.error('加载预览图失败:', imgErr);
            }
          }

          // 3. 绘制文字
          for (let item of this.data.textItems) {
            ctx.font = `bold ${item.size}px sans-serif`;
            ctx.fillStyle = item.color;
            ctx.textBaseline = 'top';
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText(item.content, item.x + 12, item.y + 8);
            ctx.shadowColor = 'transparent';
          }

          wx.canvasToTempFilePath({
            canvas,
            x: 0,
            y: 0,
            width: width * exportScale,
            height: height * exportScale,
            destWidth: width * dpr * exportScale,
            destHeight: height * dpr * exportScale,
            success: (resTemp) => resolve(resTemp.tempFilePath),
            fail: (err) => reject(err)
          });
        });
      });
    });
  }
});
