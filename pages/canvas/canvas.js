Page({
  data: {
    tabs: ['👗 单品库', '🖼️ 杂志模板', '✨ 滤镜/去色'],
    activeTab: 0,
    categories: ["全部", "上装", "下装", "连衣裙", "鞋履", "配饰"],
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
      this.loadOutfit(options.id);
    } else {
      this.fetchClothes();
    }
  },

  loadOutfit(id) {
    wx.showLoading({ title: '还原搭配中...', mask: true });
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
        
        // 此处需要注意：URL 需要从 clothes 集合中重新映射，或者保存时就存好全量信息
        // 目前简单还原布局，假设 item.url 已经包含在保存的 context 中
        // 为了稳健性，我们在保存时其实存了 url，但上面的序列化只存了基础配置
        // 需要在 fetchClothes 之后进行 matching，或者更直接地在保存时存好 url
        
        // 方案：先 fetch 基础单品库，再匹配还原
        this.fetchClothes().then(() => {
          const restoredItems = config.map(conf => {
            const original = this.data.allItems.find(i => i._id === conf.id || i.id === conf.id);
            return {
              ...conf,
              url: original ? original.image_url : '',
              active: false
            };
          });
          this.setData({
            canvasItems: restoredItems,
            nextId: Math.max(...restoredItems.map(i => i.id)) + 1
          });
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('还原搭配失败', err);
    });
  },

  onShow() {
    this.fetchClothes();
  },

  fetchClothes() {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database();
      db.collection('clothes').get().then(res => {
        this.setData({
          allItems: res.data || []
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
        scale: item.scale
      }));
      this.setData({ canvasItems: items });
    }

    this.setData({
      showSaveModal: true,
      outfitTitle: '我的时尚搭配 ' + new Date().toLocaleDateString()
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
      wx.showLoading({ title: '保存搭配中...', mask: true });
      const { canvasItems, outfitTitle } = this.data;
      const clothes_ids = canvasItems.map(item => item.db_id || item.id);
      const layout_config = JSON.stringify(canvasItems.map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        scale: item.scale,
        zIndex: item.zIndex
      })));

      const outfitData = {
        title: outfitTitle,
        scene: '日常',
        description: '由画布精心搭配生成',
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
          data: outfitData
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
                  ctx.drawImage(img, relativeX + offsetX, relativeY + offsetY, drawW, drawH);
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
