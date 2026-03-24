import { CATEGORIES, WARDROBE_CATEGORIES } from '../constants'

Page({
  data: {
    tabs: ['👗 单品库', '🖼️ 杂志模板', '✨ 滤镜/去色'],
    activeTab: 0,
    categories: WARDROBE_CATEGORIES,
    activeCategory: 0,
    allItems: [], // 存储从云端获取的所有单品
    libraryItems: [], // 存储当前分类下的单品
    canvasItems: [],
    nextId: 1,
    statusBarHeight: 20,
    navBarHeight: 44,
    menuButtonWidth: 80,
    showSaveModal: false,
    outfitTitle: '',
    editingOutfitId: '',
    helperCanvasWidth: 375,
    helperCanvasHeight: 500
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height,
      menuButtonWidth: sysInfo.windowWidth - menuButton.left + 10
    });
    
    // 如果有传递 ID，则进入“重新编辑”模式，还原画布内容
    if (options.id) {
      this.setData({ editingOutfitId: options.id });
      this.loadOutfit(options.id);
    } else {
      this.fetchClothes();
    }

    if (options.date) {
      this.setData({ recordDate: options.date });
    } else {
      // 默认记录为今天
      this.setData({ recordDate: this.formatDate(new Date()) });
    }
  },

  loadOutfit(id) {
    wx.showLoading({ title: '还原穿搭中...', mask: true });
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
        const config = JSON.parse(data.canvas_data.layout_config);
        const clothesIds = data.clothes_ids || []; // 用于回退匹配（兼容旧数据）
        
        // 方案：先 fetch 基础单品库，再通过 db_id 或 clothes_ids 匹配还原
        this.fetchClothes().then(() => {
          const restoredItems = config.map((conf, index) => {
            // 优先用 db_id 匹配（新版保存的数据），回退用 clothes_ids 按索引匹配（旧数据）
            const matchId = conf.db_id || clothesIds[index];
            const original = this.data.allItems.find(i => i._id === matchId);
            return {
              ...conf,
              db_id: matchId || conf.db_id,
              url: original ? original.image_url : '',
              active: index === 0, // 第一个单品默认激活，可立即拖拽
              rotation: conf.rotation || 0
            };
          });
          this.setData({
            canvasItems: restoredItems,
            recordDate: data.record_date || this.formatDate(data.create_time),
            nextId: Math.max(...restoredItems.map(i => i.id)) + 1
          });
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('还原穿搭失败', err);
    });
  },
  
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  onShow() {
    this.fetchClothes();
  },

  fetchClothes() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: 'getClothes'
        }
      }).then(res => {
        this.setData({
          allItems: res.result.data || []
        }, () => {
          this.applyCategoryFilter();
          resolve();
        });
      }).catch(err => {
        console.error('获取单品失败', err);
        reject(err);
      });
    });
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeCategory: index }, () => {
      this.applyCategoryFilter();
    });
  },

  applyCategoryFilter() {
    const { activeCategory, categories, allItems } = this.data;
    const currentCategory = categories[activeCategory];
    
    if (currentCategory === '全部') {
      this.setData({ libraryItems: allItems });
    } else {
      const filtered = allItems.filter(item => item.category === currentCategory);
      this.setData({ libraryItems: filtered });
    }
  },

  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  },

  switchDrawerTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.index });
  },

  onItemChange(e) {
    if (e.detail.source === 'touch') {
      const id = e.currentTarget.dataset.id;
      const index = this.data.canvasItems.findIndex(i => i.id === id);
      if (index !== -1) {
        // 直接修改数据而不通过 setData，避免与组件内部状态产生死循环冲突
        // 这样可以解决位置跳变和抖动问题
        this.data.canvasItems[index].x = e.detail.x;
        this.data.canvasItems[index].y = e.detail.y;
      }
    }
  },

  onItemScale(e) {
    const id = e.currentTarget.dataset.id;
    const index = this.data.canvasItems.findIndex(i => i.id === id);
    if (index !== -1) {
      // 记录缩放比例，不使用 setData 避免缩放爆炸
      this.data.canvasItems[index].scale = e.detail.scale;
    }
  },

  activateItem(e) {
    const id = e.currentTarget.dataset.id;
    const { canvasItems } = this.data;
    
    // 找出当前激活的项是否就是被点击的项
    const currentActiveItem = canvasItems.find(i => i.active);
    if (currentActiveItem && currentActiveItem.id === id) return;

    const updates = {};
    let maxZ = 0;
    canvasItems.forEach(item => {
      if (item.zIndex > maxZ) maxZ = item.zIndex;
    });

    canvasItems.forEach((item, index) => {
      const activePath = `canvasItems[${index}].active`;
      const zIndexPath = `canvasItems[${index}].zIndex`;
      const xPath = `canvasItems[${index}].x`;
      const yPath = `canvasItems[${index}].y`;
      const scalePath = `canvasItems[${index}].scale`;
      
      if (item.id === id) {
        updates[activePath] = true;
        updates[zIndexPath] = maxZ + 1;
      } else if (item.active) {
        updates[activePath] = false;
        // 在切换前，将之前静默修改的位置和缩放同步到渲染层
        updates[xPath] = item.x;
        updates[yPath] = item.y;
        updates[scalePath] = item.scale;
      }
    });

    this.setData(updates);
  },

  removeItem(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.data.canvasItems.filter(item => item.id !== id);
    this.setData({ canvasItems: items });
  },

  addToCanvas(e) {
    const item = e.currentTarget.dataset.item;
    const newItem = {
      id: this.data.nextId,
      db_id: item._id, // 记录数据库原始 ID
      url: item.image_url,
      x: 100,
      y: 100,
      active: true,
      scale: 1,
      rotation: 0,
      zIndex: Math.max(...this.data.canvasItems.map(i => i.zIndex || 0), 0) + 1
    };
    
    const items = this.data.canvasItems.map(item => ({...item, active: false}));
    items.push(newItem);
    
    this.setData({ 
      canvasItems: items,
      nextId: this.data.nextId + 1
    });
  },

  clearCanvas() {
    wx.showModal({
      title: '提示',
      content: '确定要清空画布吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ canvasItems: [] });
        }
      }
    });
  },

  saveCanvas() {
    const { canvasItems } = this.data;
    if (canvasItems.length === 0) {
      wx.showToast({ title: '画布是空的哦', icon: 'none' });
      return;
    }

    const activeItem = canvasItems.find(i => i.active);
    if (activeItem) {
      const items = canvasItems.map(item => ({
        ...item,
        x: item.x,
        y: item.y,
        scale: item.scale,
        rotation: item.rotation || 0
      }));
      this.setData({ canvasItems: items });
    }

    this.setData({
      showSaveModal: true,
      outfitTitle: ''
    });
  },

  onTitleInput(e) {
    this.setData({ outfitTitle: e.detail.value });
  },

  stopBubble() {
    // 阻止冒泡到遮罩层
  },

  closeSaveModal() {
    this.setData({ showSaveModal: false });
  },

  confirmSave() {
    if (!this.data.outfitTitle.trim()) {
      wx.showToast({ title: '请输入穿搭名称', icon: 'none' });
      return;
    }
    this.setData({ showSaveModal: false });
    this.processSave();
  },

  async processSave() {
    wx.showLoading({ title: '正在渲染...', mask: true });
    
    try {
      // 1. 渲染画布为图片
      const tempFilePath = await this.generateCanvasImage();
      
      // 2. 上传到云存储
      wx.showLoading({ title: '正在上传封面...', mask: true });
      const cloudPath = `outfit_covers/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempFilePath,
      });
      const previewUrl = uploadRes.fileID;

      // 3. 保存到数据库
      wx.showLoading({ title: '保存穿搭中...', mask: true });
      const { canvasItems, outfitTitle } = this.data;
      const clothes_ids = canvasItems.map(item => item.db_id || item.id);
      const layout_config = JSON.stringify(canvasItems.map(item => ({
        id: item.id,
        db_id: item.db_id,
        x: item.x,
        y: item.y,
        scale: item.scale,
        rotation: item.rotation || 0,
        zIndex: item.zIndex
      })));

      const outfitData = {
        title: outfitTitle,
        scene: '日常',
        description: '由画布精心穿搭生成',
        preview_url: previewUrl,
        clothes_ids: clothes_ids,
        canvas_data: {
          background_color: '#F5F5F5',
          layout_config: layout_config
        }
      };

      const res = await wx.cloud.callFunction({
        name: 'outfitFunctions',
        data: {
          type: 'addOutfit',
          data: {
            id: this.data.editingOutfitId || undefined,
            ...outfitData,
            recordDate: this.data.recordDate
          }
        }
      });

      wx.hideLoading();
      if (res.result && res.result.success) {
        wx.showToast({ title: '已保存到穿搭', icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/looks/looks' });
        }, 1500);
      } else {
        throw new Error(res.result.errMsg || '保存失败');
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '操作失败: ' + err.message, icon: 'none' });
      console.error('保存流程失败', err);
    }
  },

  startRotate(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.data.canvasItems;
    const item = items.find(i => i.id === id);
    if (!item) return;

    const touch = e.touches[0];
    this.rotatingId = id; // 立即记录，防止滑动过快错过
    
    // 我们需要获取 movable-view 的中心点，微信小程序中属性选择器 [data-id] 返回值可能为空，改用 #item-id
    wx.createSelectorQuery().select(`#item-${id}`).boundingClientRect(rect => {
      if (rect) {
        this.rotateCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        const dx = touch.clientX - this.rotateCenter.x;
        const dy = touch.clientY - this.rotateCenter.y;
        this.initAngle = (Math.atan2(dy, dx) * 180 / Math.PI) || 0;
        this.startRotation = item.rotation || 0;
      }
    }).exec();
  },

  doRotate(e) {
    if (this.rotatingId !== e.currentTarget.dataset.id || !this.rotateCenter) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - this.rotateCenter.x;
    const dy = touch.clientY - this.rotateCenter.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    let delta = angle - this.initAngle;
    let newRotation = this.startRotation + delta;
    
    const index = this.data.canvasItems.findIndex(i => i.id === this.rotatingId);
    if (index !== -1) {
      this.setData({
        [`canvasItems[${index}].rotation`]: newRotation
      });
    }
  },

  generateCanvasImage() {
    return new Promise((resolve, reject) => {
      const areaQuery = wx.createSelectorQuery();
      areaQuery.select('.canvas-area').boundingClientRect();
      areaQuery.selectAll('.canvas-item').boundingClientRect();
      
      areaQuery.exec(async (rects) => {
        const areaRect = rects[0];
        const itemRects = rects[1];
        
        if (!areaRect) return reject(new Error('无法获取画布布局信息'));
        
        const width = areaRect.width;
        const height = areaRect.height;
        
        // 1. 同步设置画布样式尺寸
        this.setData({
          helperCanvasWidth: width,
          helperCanvasHeight: height
        }, () => {
          const canvasQuery = wx.createSelectorQuery();
          canvasQuery.select('#helperCanvas').node().exec(async (res) => {
            if (!res[0] || !res[0].node) return reject(new Error('未找到画布节点'));
            
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            // 保持透明背景
            
            // 2. 匹配 Rects 与数据中的 canvasItems (用于获取 url 和 zIndex)
            // SelectorQuery 返回的顺序通常与 WXML 中的 wx:for 顺序一致
            const itemsWithRects = this.data.canvasItems.map((item, index) => ({
              ...item,
              rect: itemRects[index]
            })).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

            try {
              let minX = width, minY = height, maxX = 0, maxY = 0;
              let hasItems = false;

              // 清空背景
              ctx.clearRect(0, 0, width, height);

              for (const item of itemsWithRects) {
                if (!item.rect) continue;
                hasItems = true;

                const info = await new Promise((resImg) => {
                  wx.getImageInfo({
                    src: item.url,
                    success: resImg,
                    fail: () => resImg(null)
                  });
                });

                if (info && info.path) {
                  const img = canvas.createImage();
                  await new Promise((resLoad) => {
                    img.onload = resLoad;
                    img.onerror = (e) => {
                      console.error('图片加载失败:', item.url, e);
                      resLoad();
                    };
                    img.src = info.path;
                  });

                  if (img.width === 0) continue;

                  const relativeX = item.rect.left - areaRect.left;
                  const relativeY = item.rect.top - areaRect.top;
                  
                  // 实现 aspectFit 渲染逻辑，防止变形
                  const rectW = item.rect.width;
                  const rectH = item.rect.height;
                  const imgRatio = info.width / info.height;
                  const rectRatio = rectW / rectH;
                  
                  let drawW, drawH, offsetX = 0, offsetY = 0;
                  if (imgRatio > rectRatio) {
                    drawW = rectW;
                    drawH = rectW / imgRatio;
                    offsetY = (rectH - drawH) / 2;
                  } else {
                    drawH = rectH;
                    drawW = rectH * imgRatio;
                    offsetX = (rectW - drawW) / 2;
                  }

                  ctx.save();
                  // 将坐标系平移到 movable-view 的中心
                  const centerX = relativeX + rectW / 2;
                  const centerY = relativeY + rectH / 2;
                  ctx.translate(centerX, centerY);
                  // 旋转
                  if (item.rotation) {
                    ctx.rotate(item.rotation * Math.PI / 180);
                  }
                  // 在中心点绘制（因此坐标需要减去宽高的一半）
                  // 注意 offsetX / offsetY 也要加上
                  ctx.drawImage(img, -rectW / 2 + offsetX, -rectH / 2 + offsetY, drawW, drawH);
                  ctx.restore();

                  // 更新边界
                  minX = Math.min(minX, relativeX);
                  minY = Math.min(minY, relativeY);
                  maxX = Math.max(maxX, relativeX + rectW);
                  maxY = Math.max(maxY, relativeY + rectH);
                }
              }

              // 4. 导出 (带裁剪)
              const padding = 20; // 留白边距
              let exportX = 0, exportY = 0, exportWidth = width, exportHeight = height;

              if (hasItems) {
                exportX = Math.max(0, minX - padding);
                exportY = Math.max(0, minY - padding);
                exportWidth = Math.min(width - exportX, (maxX - minX) + padding * 2);
                exportHeight = Math.min(height - exportY, (maxY - minY) + padding * 2);
              }

              // 在 Canvas 2D 中，x, y, width, height 对应逻辑像素 (CSS 尺寸)
              // 而 destWidth, destHeight 对应导出分辨率 (物理像素)
              wx.canvasToTempFilePath({
                canvas,
                x: exportX,
                y: exportY,
                width: exportWidth,
                height: exportHeight,
                destWidth: exportWidth * dpr,
                destHeight: exportHeight * dpr,
                success: (res) => resolve(res.tempFilePath),
                fail: (err) => {
                  console.error('canvasToTempFilePath 失败:', err);
                  reject(err);
                }
              });
            } catch (err) {
              reject(err);
            }
          });
        });
      });
    });
  },
});
