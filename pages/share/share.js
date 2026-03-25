Page({
  data: {
    look: {},
    backgrounds: [
      { id: 'mini1', type: 'solid', value: '#FFFDF5', css: '#FFFDF5' }, // 奶油米
      { id: 'mini2', type: 'solid', value: '#F5F5F7', css: '#F5F5F7' }, // 极简灰
      { id: 'mini3', type: 'solid', value: '#E8EBE4', css: '#E8EBE4' }, // 灰鼠草绿
      { id: 'mini4', type: 'solid', value: '#F2E6E6', css: '#F2E6E6' }, // 莫兰迪粉
      { id: 'mini5', type: 'gradient', colors: ['#F9F9F9', '#F1F1F1'], css: 'linear-gradient(180deg, #F9F9F9 0%, #F1F1F1 100%)' }, // 极简渐变1
      { id: 'mini6', type: 'gradient', colors: ['#FFFDF5', '#F5F0E6'], css: 'linear-gradient(135deg, #FFFDF5 0%, #F5F0E6 100%)' }, // 极简渐变2
      { id: 'mini7', type: 'solid', value: '#EBDED5', css: '#EBDED5' }, // 陶土色
      // { id: 'mini8', type: 'solid', value: '#1C1C1E', css: '#1C1C1E' }, // 极简黑
      { id: 'mini9', type: 'solid', value: '#E5E5F2', css: '#E5E5F2' }, // 柔薰衣草
      { id: 'bg1', type: 'solid', value: '#F2F2F7', css: '#2feef7b8' },
      { id: 'bg2', type: 'solid', value: '#FFFFFF', css: '#e297fb' },
      { id: 'bg3', type: 'solid', value: '#FFE5E5', css: '#FFE5E5' },
      { id: 'bg4', type: 'solid', value: '#E5F3FF', css: '#E5F3FF' },
      { id: 'bg5', type: 'solid', value: '#E8FFE5', css: '#E8FFE5' },
      { id: 'bg6', type: 'solid', value: '#FFF5E5', css: '#FFF5E5' },
      { id: 'bg7', type: 'solid', value: '#F3E5FF', css: '#F3E5FF' },
      { id: 'grad1', type: 'gradient', colors: ['#a18cd1', '#fbc2eb'], css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
      { id: 'grad2', type: 'gradient', colors: ['#ff9a9e', '#fecfef'], css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
      { id: 'grad3', type: 'gradient', colors: ['#84fab0', '#8fd3f4'], css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
      { id: 'grad4', type: 'gradient', colors: ['#fccb90', '#d57eeb'], css: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
      { id: 'grad5', type: 'gradient', colors: ['#e0c3fc', '#8ec5fc'], css: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
      { id: 'grid1', type: 'solid', value: '#FFFFFF', css: 'linear-gradient(#F0F0F0 1px, transparent 1px), linear-gradient(90deg, #F0F0F0 1px, transparent 1px)', grid: true }, // 极简网格
      { id: 'grid2', type: 'solid', value: '#FFFFFF', css: 'radial-gradient(#D1D1D1 1.5px, transparent 1.5px)', dots: true }, // 极简点阵
      { id: 'img1', type: 'image', value: '/assets/backgrounds/bg_light_wood.png', css: 'url(/assets/backgrounds/bg_light_wood.png)' },
      { id: 'img2', type: 'image', value: '/assets/backgrounds/bg_beige_linen.png', css: 'url(/assets/backgrounds/bg_beige_linen.png)' },
      { id: 'img3', type: 'image', value: '/assets/backgrounds/bg_soft_marble.png', css: 'url(/assets/backgrounds/bg_soft_marble.png)' },

    ],
    selectedBg: { id: 'bg1', type: 'solid', value: '#F2F2F7', css: '#F2F2F7' },
    textColors: [
      '#000000', '#333333', '#8E8E93', '#FFFFFF', 
      '#FF3B30', '#FF2D55', '#FF9500', '#FFCC00', 
      '#34C759', '#4CD964', '#5AC8FA', '#007AFF', 
      '#5856D6', '#AF52DE', '#A2845E'
    ],
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
    },
    isMulti: false,
    imageUrls: []
  },

  onLoad(options) {
    if (options.items) {
      // 扭蛋机多图模式
      const urls = decodeURIComponent(options.items).split(',');
      this.setData({
        isMulti: true,
        imageUrls: urls,
        look: {
          title: options.type === 'recommendation' ? '今日扭蛋灵感' : '我的灵感推荐',
          preview_url: urls[0] // 兼容部分旧逻辑
        }
      });
    } else if (options.id) {
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

  onShareAppMessage() {
    return {
      title: '发现一个超赞的穿搭灵感，快来康康！',
      path: `/pages/look_detail/look_detail?id=${this.data.look._id}`,
      imageUrl: this.data.look.preview_url
    };
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
          const footerHeight = 100; // 底部品牌区高度
          
          canvas.width = width * dpr * exportScale;
          canvas.height = (height + footerHeight) * dpr * exportScale;
          
          ctx.scale(dpr * exportScale, dpr * exportScale);

          // 1. 绘制背景 (仅在画板区域)
          const bg = this.data.selectedBg;
          if (bg.type === 'gradient') {
            const grd = ctx.createLinearGradient(0, 0, width, height);
            grd.addColorStop(0, bg.colors[0]);
            grd.addColorStop(1, bg.colors[1]);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, width, height);
          } else if (bg.type === 'image') {
            try {
              const bgInfo = await new Promise((resBg) => {
                wx.getImageInfo({
                  src: bg.value,
                  success: resBg,
                  fail: () => resBg(null)
                });
              });
              if (bgInfo && bgInfo.path) {
                const bgImg = canvas.createImage();
                await new Promise((resL) => {
                  bgImg.onload = resL;
                  bgImg.src = bgInfo.path;
                });
                ctx.drawImage(bgImg, 0, 0, width, height);
              } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
              }
            } catch (err) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
            }
          } else if (bg.grid) {
            // 绘制网格背景
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = '#F0F0F0';
            ctx.lineWidth = 1;
            const step = 20;
            for (let x = 0; x <= width; x += step) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, height);
              ctx.stroke();
            }
            for (let y = 0; y <= height; y += step) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(width, y);
              ctx.stroke();
            }
          } else if (bg.dots) {
            // 绘制点阵背景
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#D1D1D1';
            const step = 20;
            for (let x = 10; x <= width; x += step) {
              for (let y = 10; y <= height; y += step) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          } else {
            ctx.fillStyle = bg.value;
            ctx.fillRect(0, 0, width, height);
          }

          // 2. 绘制品牌区 (Footer)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, height, width, footerHeight);
          
          // 分割线
          ctx.strokeStyle = '#EEEEEE';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(width, height);
          ctx.stroke();

          // 小程序名称
          ctx.font = 'bold 16px sans-serif';
          ctx.fillStyle = '#333333';
          ctx.textBaseline = 'middle';
          ctx.fillText('灵感衣橱 | Inspired Wardrobe', 20, height + footerHeight / 2 - 8);
          
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#999999';
          ctx.fillText('发现穿搭灵感，让美触手可及', 20, height + footerHeight / 2 + 12);

          // 绘制小程序码图片
          const qrSize = 80;
          const qrX = width - qrSize - 20;
          const qrY = height + (footerHeight - qrSize) / 2;
          
          try {
            const qrImg = canvas.createImage();
            await new Promise((resLoad, rejLoad) => {
              qrImg.onload = resLoad;
              qrImg.onerror = rejLoad;
              qrImg.src = '/pages/images/qrX.jpg';
            });
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          } catch (qrErr) {
            console.error('加载小程序码失败:', qrErr);
          }

          // 3. 绘制穿搭预览图 (多图堆叠布局)
          if (this.data.isMulti) {
            const spacing = 20; // 对应 CSS 中的 margin-bottom
            let currentY = 25;  // 对应 CSS 中的 padding-top
            
            for (let i = 0; i < this.data.imageUrls.length; i++) {
              const url = this.data.imageUrls[i];
              try {
                const info = await new Promise((resImg) => {
                  wx.getImageInfo({ src: url, success: resImg, fail: () => resImg(null) });
                });
 
                if (info && info.path) {
                  const img = canvas.createImage();
                  await new Promise((resL) => {
                    img.onload = resL;
                    img.src = info.path;
                  });
 
                  // 真正的自适应高度：宽度固定，高度按比例缩放
                  const imgRatio = info.width / info.height;
                  const drawW = width * 0.95;
                  const drawH = drawW / imgRatio;
                  const posX = (width - drawW) / 2;
 
                  ctx.drawImage(img, posX, currentY, drawW, drawH);
                  currentY += drawH + spacing;
                }
              } catch (e) { console.error('绘制多图失败:', e); }
            }
          } else if (this.data.look.preview_url) {
            // 原有单图逻辑
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
            width: width * dpr * exportScale,
            height: (height + footerHeight) * dpr * exportScale,
            destWidth: width * dpr * exportScale,
            destHeight: (height + footerHeight) * dpr * exportScale,
            success: (resTemp) => resolve(resTemp.tempFilePath),
            fail: (err) => reject(err)
          });
        });
      });
    });
  }
});
