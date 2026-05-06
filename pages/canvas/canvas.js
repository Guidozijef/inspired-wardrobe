import { WARDROBE_CATEGORIES } from '../constants'

const BACKGROUNDS = [
  // 【网格第1行】明亮纯色
  { id: 'solid1', type: 'solid', value: '#FFFFFF', css: '#FFFFFF', label: '纯白' },
  { id: 'solid2', type: 'solid', value: '#F7F8FA', css: '#F7F8FA', label: '极简灰' },
  { id: 'solid5', type: 'solid', value: '#F8F4EC', css: '#F8F4EC', label: '奶油燕麦' },
  { id: 'solid6', type: 'solid', value: '#EAE5DF', css: '#EAE5DF', label: '拿铁咖啡' },

  // 【网格第2行】莫兰迪纯色
  { id: 'solid8', type: 'solid', value: '#E3E5D7', css: '#E3E5D7', label: '日系抹茶' },
  { id: 'solid9', type: 'solid', value: '#D8E2E8', css: '#D8E2E8', label: '雾霾海蓝' },
  { id: 'solid10', type: 'solid', value: '#E8D8D8', css: '#E8D8D8', label: '干枯玫瑰' },
  { id: 'solid12', type: 'solid', value: '#BAAFAF', css: '#BAAFAF', label: '紫雾灰' },

    // 【网格第6行】纯净光晕渐变
  { id: 'grad1', type: 'gradient', colors: ['#FDFBFB', '#EBEDEE'], css: 'linear-gradient(135deg, #FDFBFB 0%, #EBEDEE 100%)', label: '银河光晕' },
  { id: 'grad2', type: 'gradient', colors: ['#FEF9F2', '#EAE0D5'], css: 'linear-gradient(135deg, #FEF9F2 0%, #EAE0D5 100%)', label: '晨曦奶油' },
  { id: 'grad3', type: 'gradient', colors: ['#F5E6E6', '#E4D5CE'], css: 'linear-gradient(135deg, #F5E6E6 0%, #E4D5CE 100%)', label: '玫瑰薄雾' },
  { id: 'grad4', type: 'gradient', colors: ['#E0EAFC', '#CFDEF3'], css: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)', label: '清晨海岛' },

  // 【网格第3行】高级纸本（横线与网格点阵）
  { id: 'note1', type: 'solid', value: '#FFFFFF', css: 'linear-gradient(transparent 95%, #F0F0F0 95%) #FFFFFF', bgSize: '100% 30px', label: '极简横线' },
  { id: 'note2', type: 'solid', value: '#FCFBF6', css: 'linear-gradient(transparent 95%, #EBE8DA 95%) #FCFBF6', bgSize: '100% 30px', label: '护眼横格' },
  { id: 'grid_xiaomi', type: 'solid', value: '#FDFCF8', css: 'linear-gradient(#EFECE1 1px, transparent 1px), linear-gradient(90deg, #EFECE1 1px, transparent 1px) #FDFCF8', bgSize: '24px 24px', label: '复古方格' },
  { id: 'dots_warm', type: 'solid', value: '#FCFBF9', css: 'radial-gradient(#D6D4CA 1.5px, transparent 1.5px) #FCFBF9', bgSize: '20px 20px', label: '手帐点阵' },

  // 【网格第4行】实景材质
  { id: 'img3', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_plaster_shadow.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_plaster_shadow.png)', label: '白墙光影' },
  // { id: 'img2', type: 'image', value: '/assets/backgrounds/bg_beige_linen.png', css: 'url(/assets/backgrounds/bg_beige_linen.png)', label: '粗纺亚麻' },
  { id: 'img5', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_terrazzo.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_terrazzo.png)', label: '纯净水磨石' },
  { id: 'img1', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_light_wood.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_light_wood.png)', label: '原木底纹' },

  // 【网格第5行】节庆与插画模板
  { id: 'img_new_year', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_new_year_floral.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_new_year_floral.png)', label: '新年可期' },
  { id: 'img_botanical', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_cute_botanical.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_cute_botanical.png)', label: '植物手帐' },
  { id: 'img_vintage_frame', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_vintage_frame.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_vintage_frame.png)', label: '复古相框' },
  { id: 'img_christmas', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_christmas.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_christmas.png)', label: '圣诞物语' },
  { id: 'img_autumn', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_autumn.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_autumn.png)', label: '秋日落叶' },
  { id: 'img_memphis', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_memphis.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_memphis.png)', label: '孟菲斯波点' },
  { id: 'img_spring_cherry', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_spring_cherry.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_spring_cherry.png)', label: '春日樱花' },
  { id: 'img_scrapbook_tape', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_scrapbook_tape.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_scrapbook_tape.png)', label: '手账胶带' },
  { id: 'img_summer_beach', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_summer_beach.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_summer_beach.png)', label: '夏日海滩' },
  { id: 'img_neon_cyberpunk', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_neon_cyberpunk.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_neon_cyberpunk.png)', label: '赛博霓虹' },
  { id: 'img_clouds_stars', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_clouds_stars.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_clouds_stars.png)', label: '云端星空' },
  { id: 'img_gold_foliage', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_gold_foliage.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_gold_foliage.png)', label: '烫金落叶' },

  // 【网格第6行】丝滑光晕与辅助预设
  { id: 'img4', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_beige_silk.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_beige_silk.png)', label: '柔滑丝绸' },
  { id: 'img6', type: 'image', value: 'cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_aura_grain.png', css: 'url(cloud://rest-api-6gm73bqx23252469.7265-rest-api-6gm73bqx23252469-1409755190/backgrounds/bg_aura_grain.png)', label: '胶片柔光斑' },
  { id: 'grid1', type: 'solid', value: '#FFFFFF', css: 'linear-gradient(#F0F0F0 1px, transparent 1px), linear-gradient(90deg, #F0F0F0 1px, transparent 1px) #FFFFFF', bgSize: '20px 20px', grid: true, label: '基础网格' },
  { id: 'grid2', type: 'solid', value: '#FFFFFF', css: 'radial-gradient(#D1D1D1 1.5px, transparent 1.5px) #FFFFFF', bgSize: '16px 16px', dots: true, label: '细密点阵' },

]

const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right']

Page({
  data: {
    tabs: ['单品库', '背景', '文字', '✨ AI魔法'],
    activeTab: 0,
    categories: WARDROBE_CATEGORIES,
    activeCategory: 0,
    allItems: [],
    libraryItems: [],
    canvasItems: [],
    nextId: 1,
    statusBarHeight: 20,
    navBarHeight: 44,
    menuButtonWidth: 80,
    showSaveModal: false,
    outfitTitle: '',
    editingOutfitId: '',
    helperCanvasWidth: 375,
    helperCanvasHeight: 500,
    recordDate: '',
    backgrounds: BACKGROUNDS,
    selectedBg: BACKGROUNDS.find((item) => item.id === 'solid2'),
    textAlignOptions: TEXT_ALIGN_OPTIONS,
    textColors: [
      // 基础黑白灰
      '#000000','#FFFFFF','#808080',
      // 高饱和亮色（剪映经典必备色）
      '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
      // 流行马卡龙色/低饱和粉彩
      '#FFD4D4', '#FFE8D4', '#FFF5D4', '#E1FFD4', '#D4FDFF', '#D4E8FF', '#E8D4FF', '#FFD4ED',
      // 浓郁深高贵色
      '#8A1C1C', '#A85B2A', '#9B7400', '#1C6B2C', '#0A6E6A', '#134075', '#3A2073', '#731742',
      // 复古大地色/莫兰迪
      '#F5E6D3', '#D6B89E', '#A38068', '#869679', '#788A99', '#897A8C'
    ],
    textItems: [],
    nextTextId: 1,
    activeTextId: null,
    activeTextIndex: -1,
    editingTextId: null,
    editingTextIndex: -1,
    activeTextDraft: '',
    canvasInputFocus: false,
    dragInfo: {
      id: null,
      startX: 0,
      startY: 0,
      initX: 0,
      initY: 0
    },
    aiPrompt: '',
    aiTags: ['极简画室', '日落海滩', '巴黎街头', '复古老钱风', '赛博朋克霓虹', '莫兰迪色纯净空间']
  },

  goBack() {
    wx.navigateBack();
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    const menuButton = wx.getMenuButtonBoundingClientRect()

    this.pendingEditAction = null
    this.pendingActionTimer = null
    this.canvasInputFocusTimer = null
    this.rotateCenter = null
    this.rotatingId = null

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height,
      menuButtonWidth: sysInfo.windowWidth - menuButton.left + 10,
      recordDate: options.date || this.formatDate(new Date())
    })

    if (options.id) {
      this.setData({ editingOutfitId: options.id })
      this.loadOutfit(options.id)
    } else {
      this.fetchClothes()
    }
  },

  onUnload() {
    this.clearCanvasInputFocusTimer()
    this.clearPendingActionTimer()
  },

  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  onShow() {
    this.fetchClothes()
  },

  fetchClothes() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'clothFunctions',
        data: { type: 'getClothes' }
      }).then((res) => {
        this.setData({
          allItems: res.result.data || []
        }, () => {
          this.applyCategoryFilter()
          resolve()
        })
      }).catch((err) => {
        console.error('获取单品失败', err)
        reject(err)
      })
    })
  },

  normalizeBackground(background, fallbackColor) {
    if (background && background.id) {
      const matchedById = this.data.backgrounds.find((item) => item.id === background.id)
      return matchedById || background
    }

    if (fallbackColor) {
      const matchedByValue = this.data.backgrounds.find((item) => item.value === fallbackColor)
      return matchedByValue || {
        id: 'bg_custom',
        type: 'solid',
        value: fallbackColor,
        css: fallbackColor,
        label: '自定义'
      }
    }

    return this.data.selectedBg
  },

  normalizeTextItems(textItems) {
    return (textItems || []).map((item, index) => ({
      id: item.id || index + 1,
      content: item.content || '',
      x: typeof item.x === 'number' ? item.x : 120,
      y: typeof item.y === 'number' ? item.y : 120,
      size: item.size || 24,
      color: item.color || '#333333',
      align: item.align || 'center',
      rotation: item.rotation || 0,
      active: false
    }))
  },

  loadOutfit(id) {
    wx.showLoading({ title: '还原穿搭中...', mask: true })
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: {
        type: 'getOutfitDetail',
        data: { id }
      }
    }).then((res) => {
      wx.hideLoading()
      if (!(res.result && res.result.success)) return

      const data = res.result.data
      const canvasData = data.canvas_data || {}
      const layoutConfig = JSON.parse(canvasData.layout_config || '[]')
      const clothesIds = data.clothes_ids || []
      const restoredBg = this.normalizeBackground(canvasData.background, canvasData.background_color)
      const restoredTextItems = this.normalizeTextItems(canvasData.text_items)
      const nextTextId = restoredTextItems.length ? Math.max(...restoredTextItems.map((item) => item.id)) + 1 : 1

      this.fetchClothes().then(() => {
        const restoredItems = layoutConfig.map((conf, index) => {
          const matchId = conf.db_id || clothesIds[index]
          const original = this.data.allItems.find((item) => item._id === matchId)
          return {
            ...conf,
            db_id: matchId || conf.db_id,
            url: original ? original.image_url : '',
            active: false,
            rotation: conf.rotation || 0,
            scale: conf.scale || 1,
            zIndex: conf.zIndex || index + 1
          }
        })

        this.setData({
          canvasItems: restoredItems,
          selectedBg: restoredBg,
          textItems: restoredTextItems,
          nextTextId,
          recordDate: data.record_date || this.formatDate(data.create_time),
          nextId: restoredItems.length ? Math.max(...restoredItems.map((item) => item.id)) + 1 : 1
        })
      })
    }).catch((err) => {
      wx.hideLoading()
      console.error('还原穿搭失败', err)
    })
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeCategory: index }, () => {
      this.applyCategoryFilter()
    })
  },

  applyCategoryFilter() {
    const currentCategory = this.data.categories[this.data.activeCategory]
    if (currentCategory === '全部') {
      this.setData({ libraryItems: this.data.allItems })
      return
    }

    this.setData({
      libraryItems: this.data.allItems.filter((item) => item.category === currentCategory)
    })
  },

  switchTab(e) {
    wx.redirectTo({ url: e.currentTarget.dataset.path })
  },

  switchDrawerTab(e) {
    const activeTab = e.currentTarget.dataset.index
    this.setData({ activeTab })

    if (activeTab !== 2) {
      this.exitTextEditing()
      return
    }

    if (this.data.activeTextId) {
      this.setData({
        editingTextId: this.data.activeTextId,
        editingTextIndex: this.data.activeTextIndex,
        canvasInputFocus: false
      }, () => {
        this.queueCanvasInputFocus()
      })
    }
  },

  onItemChange(e) {
    if (e.detail.source !== 'touch') return
    const id = e.currentTarget.dataset.id
    const index = this.data.canvasItems.findIndex((item) => item.id === id)
    if (index === -1) return
    this.data.canvasItems[index].x = e.detail.x
    this.data.canvasItems[index].y = e.detail.y
  },

  onItemScale(e) {
    const id = e.currentTarget.dataset.id
    const index = this.data.canvasItems.findIndex((item) => item.id === id)
    if (index === -1) return
    this.data.canvasItems[index].scale = e.detail.scale
  },

  activateItem(e) {
    const id = e.currentTarget.dataset.id
    const updates = {}
    const currentActiveItem = this.data.canvasItems.find((item) => item.active)
    if (currentActiveItem && currentActiveItem.id === id) return

    let maxZ = 0
    this.data.canvasItems.forEach((item) => {
      if (item.zIndex > maxZ) maxZ = item.zIndex
    })

    this.data.canvasItems.forEach((item, index) => {
      const activePath = `canvasItems[${index}].active`
      const zIndexPath = `canvasItems[${index}].zIndex`
      const xPath = `canvasItems[${index}].x`
      const yPath = `canvasItems[${index}].y`
      const scalePath = `canvasItems[${index}].scale`

      if (item.id === id) {
        updates[activePath] = true
        updates[zIndexPath] = maxZ + 1
      } else if (item.active) {
        updates[activePath] = false
        updates[xPath] = item.x
        updates[yPath] = item.y
        updates[scalePath] = item.scale
      }
    })

    this.exitTextEditing()
    this.setData(updates)
  },

  deactivateCanvasItems() {
    const activeIndex = this.data.canvasItems.findIndex((item) => item.active)
    if (activeIndex === -1) return

    this.setData({
      [`canvasItems[${activeIndex}].active`]: false
    })
  },

  removeItem(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      canvasItems: this.data.canvasItems.filter((item) => item.id !== id)
    })
  },

  addToCanvas(e) {
    const source = e.currentTarget.dataset.item
    const newItem = {
      id: this.data.nextId,
      db_id: source._id,
      url: source.image_url,
      x: 100,
      y: 100,
      active: true,
      scale: 1,
      rotation: 0,
      zIndex: Math.max(...this.data.canvasItems.map((item) => item.zIndex || 0), 0) + 1
    }

    const canvasItems = this.data.canvasItems.map((item) => ({ ...item, active: false }))
    canvasItems.push(newItem)

    this.exitTextEditing()
    this.setData({
      canvasItems,
      nextId: this.data.nextId + 1
    })
  },

  selectBg(e) {
    this.setData({ selectedBg: e.currentTarget.dataset.bg })
  },

  queueCanvasInputFocus() {
    this.clearCanvasInputFocusTimer()
    this.canvasInputFocusTimer = setTimeout(() => {
      this.setData({ canvasInputFocus: true })
      this.canvasInputFocusTimer = null
    }, 30)
  },

  clearCanvasInputFocusTimer() {
    if (!this.canvasInputFocusTimer) return
    clearTimeout(this.canvasInputFocusTimer)
    this.canvasInputFocusTimer = null
  },

  clearPendingActionTimer() {
    if (!this.pendingActionTimer) return
    clearTimeout(this.pendingActionTimer)
    this.pendingActionTimer = null
  },

  flushPendingEditAction() {
    if (!this.pendingEditAction) return
    const action = this.pendingEditAction
    this.pendingEditAction = null
    this.clearPendingActionTimer()

    if (action.type === 'edit') {
      this.openTextEditor(action.id)
      return
    }

    if (action.type === 'canvas') {
      this.handleCanvasTextPlacement(action.x, action.y)
    }
  },

  queuePendingEditAction(action) {
    this.pendingEditAction = action

    if (this.data.editingTextId && this.data.canvasInputFocus) {
      this.clearCanvasInputFocusTimer()
      this.clearPendingActionTimer()
      this.setData({ canvasInputFocus: false })
      this.pendingActionTimer = setTimeout(() => {
        this.flushPendingEditAction()
      }, 80)
      return
    }

    this.flushPendingEditAction()
  },

  getActiveTextIndexById(id) {
    return this.data.textItems.findIndex((item) => item.id === id)
  },

  openTextEditor(id) {
    const activeTextIndex = this.getActiveTextIndexById(id)
    const selectedItem = this.data.textItems[activeTextIndex]
    if (!selectedItem || activeTextIndex === -1) return

    const textItems = this.data.textItems.map((item) => ({
      ...item,
      active: item.id === id
    }))

    this.setData({
      textItems,
      activeTextId: id,
      activeTextIndex,
      editingTextId: id,
      editingTextIndex: activeTextIndex,
      activeTextDraft: selectedItem.content || '',
      activeTab: 2,
      canvasInputFocus: false
    }, () => {
      this.queueCanvasInputFocus()
    })
  },

  handleCanvasTextPlacement(x, y) {
    const { activeTextId, activeTextDraft, textItems, nextTextId } = this.data

    if (activeTextId && !String(activeTextDraft || '').trim()) {
      const currentIndex = this.getActiveTextIndexById(activeTextId)
      if (currentIndex !== -1) {
        this.setData({
          [`textItems[${currentIndex}].x`]: x,
          [`textItems[${currentIndex}].y`]: y,
          activeTextIndex: currentIndex,
          editingTextId: activeTextId,
          editingTextIndex: currentIndex,
          canvasInputFocus: false
        }, () => {
          this.queueCanvasInputFocus()
        })
      }
      return
    }

    const newItem = {
      id: nextTextId,
      content: '',
      x,
      y,
      size: 24,
      color: '#333333',
      align: 'center',
      rotation: 0,
      active: true
    }

    const updatedItems = textItems.map((item) => ({ ...item, active: false }))
    updatedItems.push(newItem)

    this.setData({
      textItems: updatedItems,
      nextTextId: nextTextId + 1,
      activeTextId: newItem.id,
      activeTextIndex: updatedItems.length - 1,
      editingTextId: newItem.id,
      editingTextIndex: updatedItems.length - 1,
      activeTextDraft: '',
      activeTab: 2,
      canvasInputFocus: false
    }, () => {
      this.queueCanvasInputFocus()
    })
  },

  removeTextById(id, callback) {
    const updatedItems = this.data.textItems.filter((item) => item.id !== id)
    const isActive = this.data.activeTextId === id
    const isEditing = this.data.editingTextId === id
    const nextActiveTextId = isActive ? null : this.data.activeTextId
    const nextEditingTextId = isEditing ? null : this.data.editingTextId

    this.setData({
      textItems: updatedItems,
      activeTextId: nextActiveTextId,
      activeTextIndex: nextActiveTextId ? updatedItems.findIndex((item) => item.id === nextActiveTextId) : -1,
      editingTextId: nextEditingTextId,
      editingTextIndex: nextEditingTextId ? updatedItems.findIndex((item) => item.id === nextEditingTextId) : -1,
      activeTextDraft: isActive ? '' : this.data.activeTextDraft,
      canvasInputFocus: isEditing ? false : this.data.canvasInputFocus
    }, callback)
  },

  onCanvasTap(e) {
    this.deactivateCanvasItems()

    if (this.data.activeTab !== 2) {
      this.exitTextEditing()
      return
    }

    const touchX = e.detail.x
    const touchY = e.detail.y

    wx.createSelectorQuery().select('#canvasArea').boundingClientRect((rect) => {
      if (!rect) return

      const x = Math.min(Math.max(touchX - rect.left, 24), rect.width - 24)
      const y = Math.min(Math.max(touchY - rect.top - 18, 16), rect.height - 44)
      this.queuePendingEditAction({ type: 'canvas', x, y })
    }).exec()
  },

  activateText(e) {
    this.deactivateCanvasItems()
    this.queuePendingEditAction({ type: 'edit', id: e.currentTarget.dataset.id })
  },

  onActiveTextInput(e) {
    const activeTextDraft = e.detail.value
    const index = this.data.editingTextIndex
    if (index === -1) {
      this.setData({ activeTextDraft })
      return
    }

    this.setData({
      activeTextDraft,
      [`textItems[${index}].content`]: activeTextDraft,
      canvasInputFocus: true
    })
  },

  exitTextEditing() {
    this.clearCanvasInputFocusTimer()
    this.clearPendingActionTimer()
    this.pendingEditAction = null

    const textItems = this.data.textItems.map((item) => ({ ...item, active: false }))
    this.setData({
      textItems,
      activeTextId: null,
      activeTextIndex: -1,
      editingTextId: null,
      editingTextIndex: -1,
      activeTextDraft: '',
      canvasInputFocus: false
    })
  },

  onCanvasTextBlur() {
    this.clearCanvasInputFocusTimer()

    if (!this.data.editingTextId) {
      this.setData({ canvasInputFocus: false }, () => {
        this.flushPendingEditAction()
      })
      return
    }

    const activeItem = this.data.textItems[this.data.editingTextIndex]
    if (!activeItem || !String(activeItem.content || '').trim()) {
      this.removeTextById(this.data.editingTextId, () => {
        this.flushPendingEditAction()
      })
      return
    }

    this.setData({
      editingTextId: null,
      editingTextIndex: -1,
      canvasInputFocus: false
    }, () => {
      this.flushPendingEditAction()
    })
  },

  deleteText(e) {
    const id = e.currentTarget.dataset.id
    this.clearPendingActionTimer()
    this.pendingEditAction = null
    this.removeTextById(id)
  },

  changeTextColor(e) {
    if (this.data.activeTextIndex === -1) return
    this.setData({
      [`textItems[${this.data.activeTextIndex}].color`]: e.currentTarget.dataset.color
    })
  },

  changeTextSize(e) {
    if (this.data.activeTextIndex === -1) return
    this.setData({
      [`textItems[${this.data.activeTextIndex}].size`]: Number(e.detail.value)
    })
  },

  changeTextAlign(e) {
    if (this.data.activeTextIndex === -1) return
    this.setData({
      [`textItems[${this.data.activeTextIndex}].align`]: e.currentTarget.dataset.align
    })
  },

  onTextTouchStart(e) {
    this.deactivateCanvasItems()

    const id = e.currentTarget.dataset.id
    const touch = e.touches[0]
    const activeTextIndex = this.getActiveTextIndexById(id)
    const item = this.data.textItems[activeTextIndex]
    if (!item) return

    if (!item.active) {
      const textItems = this.data.textItems.map((textItem) => ({
        ...textItem,
        active: textItem.id === id
      }))

      this.setData({
        textItems,
        activeTextId: id,
        activeTextIndex,
        editingTextId: null,
        editingTextIndex: -1,
        activeTextDraft: item.content || '',
        canvasInputFocus: false
      })
    } else if (this.data.canvasInputFocus) {
      this.setData({
        editingTextId: null,
        editingTextIndex: -1,
        canvasInputFocus: false
      })
    }

    this.data.dragInfo = {
      id,
      startX: touch.clientX,
      startY: touch.clientY,
      initX: item.x,
      initY: item.y
    }
  },

  onTextTouchMove(e) {
    const dragInfo = this.data.dragInfo
    if (!dragInfo.id) return
    const index = this.getActiveTextIndexById(dragInfo.id)
    if (index === -1) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragInfo.startX
    const deltaY = touch.clientY - dragInfo.startY

    this.setData({
      [`textItems[${index}].x`]: dragInfo.initX + deltaX,
      [`textItems[${index}].y`]: dragInfo.initY + deltaY
    })
  },

  onTextTouchEnd() {
    this.data.dragInfo = { id: null, startX: 0, startY: 0, initX: 0, initY: 0 }
  },

  clearCanvas() {
    wx.showModal({
      title: '提示',
      content: '确定要清空画布吗？',
      success: (res) => {
        if (!res.confirm) return
        this.exitTextEditing()
        this.setData({
          canvasItems: [],
          textItems: [],
          nextId: 1,
          nextTextId: 1
        })
      }
    })
  },

  saveCanvas() {
    if (this.data.canvasItems.length === 0 && this.data.textItems.length === 0) {
      wx.showToast({ title: '画布还是空的哦', icon: 'none' })
      return
    }

    const activeItem = this.data.canvasItems.find((item) => item.active)
    if (activeItem) {
      const canvasItems = this.data.canvasItems.map((item) => ({
        ...item,
        x: item.x,
        y: item.y,
        scale: item.scale,
        rotation: item.rotation || 0
      }))
      this.setData({ canvasItems })
    }

    this.setData({
      showSaveModal: true,
      outfitTitle: ''
    })
  },

  onTitleInput(e) {
    this.setData({ outfitTitle: e.detail.value })
  },

  stopBubble() {},

  closeSaveModal() {
    this.setData({ showSaveModal: false })
  },

  confirmSave() {
    if (!this.data.outfitTitle.trim()) {
      wx.showToast({ title: '请输入穿搭名称', icon: 'none' })
      return
    }

    this.setData({ showSaveModal: false })
    this.processSave()
  },

  async processSave() {
    wx.showLoading({ title: '正在渲染...', mask: true })

    try {
      const tempFilePath = await this.generateCanvasImage()

      wx.showLoading({ title: '正在上传封面...', mask: true })
      const cloudPath = `outfit_covers/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      })

      wx.showLoading({ title: '保存穿搭中...', mask: true })

      const clothesIds = this.data.canvasItems.map((item) => item.db_id || item.id)
      const layoutConfig = JSON.stringify(this.data.canvasItems.map((item) => ({
        id: item.id,
        db_id: item.db_id,
        x: item.x,
        y: item.y,
        scale: item.scale,
        rotation: item.rotation || 0,
        zIndex: item.zIndex
      })))

      const res = await wx.cloud.callFunction({
        name: 'outfitFunctions',
        data: {
          type: 'addOutfit',
          data: {
            id: this.data.editingOutfitId || undefined,
            title: this.data.outfitTitle,
            scene: '日常',
            description: '由画布精心排版生成',
            preview_url: uploadRes.fileID,
            clothes_ids: clothesIds,
            canvas_data: {
              background: this.data.selectedBg,
              background_color: this.data.selectedBg.value || '#F2F2F7',
              layout_config: layoutConfig,
              text_items: this.data.textItems.map((item) => ({
                id: item.id,
                content: item.content,
                x: item.x,
                y: item.y,
                size: item.size,
                color: item.color,
                align: item.align,
                rotation: item.rotation || 0
              }))
            },
            recordDate: this.data.recordDate
          }
        }
      })

      wx.hideLoading()
      if (!(res.result && res.result.success)) {
        throw new Error(res.result.errMsg || '保存失败')
      }

      wx.showToast({ title: '已保存到穿搭', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/looks/looks' })
      }, 1200)
    } catch (err) {
      wx.hideLoading()
      console.error('保存流程失败', err)
      wx.showToast({ title: `操作失败: ${err.message}`, icon: 'none' })
    }
  },

  startRotate(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.canvasItems.find((canvasItem) => canvasItem.id === id)
    if (!item) return

    const touch = e.touches[0]
    this.rotatingId = id

    wx.createSelectorQuery().select(`#item-${id}`).boundingClientRect((rect) => {
      if (!rect) return
      this.rotateCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
      const dx = touch.clientX - this.rotateCenter.x
      const dy = touch.clientY - this.rotateCenter.y
      this.initAngle = (Math.atan2(dy, dx) * 180 / Math.PI) || 0
      this.startRotation = item.rotation || 0
    }).exec()
  },

  doRotate(e) {
    if (this.rotatingId !== e.currentTarget.dataset.id || !this.rotateCenter) return
    const touch = e.touches[0]
    const dx = touch.clientX - this.rotateCenter.x
    const dy = touch.clientY - this.rotateCenter.y
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const newRotation = this.startRotation + (angle - this.initAngle)
    const index = this.data.canvasItems.findIndex((item) => item.id === this.rotatingId)
    if (index === -1) return

    this.setData({
      [`canvasItems[${index}].rotation`]: newRotation
    })
  },

  startTextRotate(e) {
    const id = e.currentTarget.dataset.id
    const index = this.getActiveTextIndexById(id)
    const item = this.data.textItems[index]
    if (!item) return

    const touch = e.touches[0]
    this.textRotatingId = id

    const selector = this.data.editingTextId === id && this.data.canvasInputFocus ? '#text-editor-overlay' : `#text-item-${id}`
    wx.createSelectorQuery().select(selector).boundingClientRect((rect) => {
      if (!rect) return
      this.textRotateCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
      const dx = touch.clientX - this.textRotateCenter.x
      const dy = touch.clientY - this.textRotateCenter.y
      this.textInitAngle = (Math.atan2(dy, dx) * 180 / Math.PI) || 0
      this.textStartRotation = item.rotation || 0
    }).exec()
  },

  doTextRotate(e) {
    const id = e.currentTarget.dataset.id
    if (this.textRotatingId !== id || !this.textRotateCenter) return

    const touch = e.touches[0]
    const dx = touch.clientX - this.textRotateCenter.x
    const dy = touch.clientY - this.textRotateCenter.y
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const newRotation = this.textStartRotation + (angle - this.textInitAngle)
    const index = this.getActiveTextIndexById(id)
    if (index === -1) return

    this.setData({
      [`textItems[${index}].rotation`]: newRotation
    })
  },

  estimateTextBox(item, ctx) {
    ctx.font = `bold ${item.size}px sans-serif`
    const textWidth = Math.max(ctx.measureText(item.content || '').width + 24, 120)
    const textHeight = item.size * 1.3 + 16
    let left = item.x

    if (item.align === 'center') {
      left = item.x - textWidth / 2
    } else if (item.align === 'right') {
      left = item.x - textWidth
    }

    return {
      left,
      top: item.y,
      width: textWidth,
      height: textHeight
    }
  },

  async drawBackground(ctx, canvas, width, height) {
    const bg = this.data.selectedBg

    if (bg.type === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, bg.colors[0])
      gradient.addColorStop(1, bg.colors[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      return
    }

    if (bg.type === 'image') {
      const tryLoadImg = (src) => new Promise((resolve) => {
        const img = canvas.createImage()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })

      // 先直接加载（本地包文件路径）
      let img = await tryLoadImg(bg.value)

      // 失败则通过 getImageInfo 解析（cloud:// 或 https 链接）
      if (!img) {
        const bgInfo = await new Promise((resolve) => {
          wx.getImageInfo({ src: bg.value, success: resolve, fail: () => resolve(null) })
        })
        if (bgInfo && bgInfo.path && bgInfo.path !== bg.value) {
          img = await tryLoadImg(bgInfo.path)
        }
      }

      if (img) {
        ctx.drawImage(img, 0, 0, width, height)
        return
      }
    }

    if (bg.grid) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = '#F0F0F0'
      ctx.lineWidth = 1
      for (let x = 0; x <= width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      return
    }

    if (bg.dots) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#D1D1D1'
      for (let x = 10; x <= width; x += 20) {
        for (let y = 10; y <= height; y += 20) {
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      return
    }

    ctx.fillStyle = bg.value || '#F2F2F7'
    ctx.fillRect(0, 0, width, height)
  },

  drawTextItems(ctx, options = {}) {
    const scale = options.scale || 1
    const offsetX = options.offsetX || 0
    const offsetY = options.offsetY || 0

    this.data.textItems.forEach((item) => {
      if (!String(item.content || '').trim()) return
      ctx.save()
      const scaledItem = {
        ...item,
        x: item.x * scale + offsetX,
        y: item.y * scale + offsetY,
        size: item.size * scale
      }
      const box = this.estimateTextBox(scaledItem, ctx)
      const textX = scaledItem.align === 'center' ? scaledItem.x : scaledItem.align === 'right' ? scaledItem.x - 12 : scaledItem.x + 12
      const textY = scaledItem.y + 8

      ctx.translate(box.left + box.width / 2, box.top + box.height / 2)
      if (scaledItem.rotation) {
        ctx.rotate(scaledItem.rotation * Math.PI / 180)
      }
      ctx.font = `bold ${scaledItem.size}px sans-serif`
      ctx.fillStyle = scaledItem.color
      ctx.textBaseline = 'top'
      ctx.textAlign = scaledItem.align || 'left'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetY = 1

      ctx.fillText(item.content, textX - (box.left + box.width / 2), textY - (box.top + box.height / 2))
      ctx.restore()
    })
  },

  generateCanvasImage() {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery()
      query.select('#canvasArea').boundingClientRect()
      query.selectAll('.canvas-item').boundingClientRect()
      query.exec((rects) => {
        const areaRect = rects[0]
        const itemRects = rects[1] || []
        if (!areaRect) {
          reject(new Error('无法获取画布布局信息'))
          return
        }

        const areaWidth = areaRect.width
        const areaHeight = areaRect.height
        // 固定导出尺寸，所有设备保持一致
        const exportWidth = 1080
        const exportHeight = 1440
        const contentScale = Math.min(exportWidth / areaWidth, exportHeight / areaHeight)
        const contentOffsetX = (exportWidth - areaWidth * contentScale) / 2
        const contentOffsetY = (exportHeight - areaHeight * contentScale) / 2

        this.setData({
          helperCanvasWidth: exportWidth,
          helperCanvasHeight: exportHeight
        }, () => {
          wx.createSelectorQuery().select('#helperCanvas').node().exec(async (res) => {
            if (!res[0] || !res[0].node) {
              reject(new Error('未找到画布节点'))
              return
            }

            try {
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              const dpr = wx.getSystemInfoSync().pixelRatio

              canvas.width = exportWidth * dpr
              canvas.height = exportHeight * dpr
              ctx.setTransform(1, 0, 0, 1, 0, 0)
              ctx.scale(dpr, dpr)
              ctx.clearRect(0, 0, exportWidth, exportHeight)

              await this.drawBackground(ctx, canvas, exportWidth, exportHeight)

              const itemsWithRects = this.data.canvasItems.map((item, index) => ({
                ...item,
                rect: itemRects[index]
              })).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

              for (const item of itemsWithRects) {
                if (!item.rect || !item.url) continue

                const info = await new Promise((resolveInfo) => {
                  wx.getImageInfo({
                    src: item.url,
                    success: resolveInfo,
                    fail: () => resolveInfo(null)
                  })
                })

                if (!(info && info.path)) continue

                const img = canvas.createImage()
                await new Promise((resolveImg) => {
                  img.onload = resolveImg
                  img.onerror = resolveImg
                  img.src = info.path
                })

                if (!img.width) continue

                const rectW = item.rect.width * contentScale
                const rectH = item.rect.height * contentScale
                const relativeX = (item.rect.left - areaRect.left) * contentScale + contentOffsetX
                const relativeY = (item.rect.top - areaRect.top) * contentScale + contentOffsetY
                const imgRatio = info.width / info.height
                const rectRatio = rectW / rectH

                let drawW
                let drawH
                let offsetX = 0
                let offsetY = 0

                if (imgRatio > rectRatio) {
                  drawW = rectW
                  drawH = rectW / imgRatio
                  offsetY = (rectH - drawH) / 2
                } else {
                  drawH = rectH
                  drawW = rectH * imgRatio
                  offsetX = (rectW - drawW) / 2
                }

                ctx.save()
                ctx.translate(relativeX + rectW / 2, relativeY + rectH / 2)
                if (item.rotation) {
                  ctx.rotate(item.rotation * Math.PI / 180)
                }
                ctx.drawImage(img, -rectW / 2 + offsetX, -rectH / 2 + offsetY, drawW, drawH)
                ctx.restore()
              }

              this.drawTextItems(ctx, {
                scale: contentScale,
                offsetX: contentOffsetX,
                offsetY: contentOffsetY
              })

              wx.canvasToTempFilePath({
                canvas,
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
                destWidth: canvas.width,
                destHeight: canvas.height,
                success: (tempRes) => resolve(tempRes.tempFilePath),
                fail: reject
              })
            } catch (err) {
              reject(err)
            }
          })
        })
      })
    })
  },

  // --- AI 魔法相关方法 ---

  onAIPromptInput(e) {
    this.setData({ aiPrompt: e.detail.value })
  },

  selectAITag(e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ aiPrompt: tag })
  },

  generateAIPoster() {
    let prompt = this.data.aiPrompt.trim()
    if (!prompt) {
      wx.showToast({ title: '请输入场景描述', icon: 'none' })
      return
    }

    wx.showLoading({ title: 'AI创作中...', mask: true })
    
    // 增加后缀以确保生成的图像适合作为背景
    const finalPrompt = prompt + "，适合作为高级海报背景，唯美光影，极简，高分辨率，无文字"

    // 调用生图云函数
    wx.cloud.callFunction({
      name: "generateImage-4IUjJb",
      data: {
        prompt: finalPrompt
      },
      success: res => {
        wx.hideLoading()
        const result = res.result

        if (result && result.success && result.imageUrl) {
          wx.showToast({ title: '魔法生效！', icon: 'success' })
          
          // 设置背景并切回背景 tab 供用户预览
          this.setData({
            selectedBg: {
              id: 'ai_generated_' + Date.now(),
              type: 'image',
              value: result.imageUrl,
              css: `url(${result.imageUrl})`,
              label: 'AI: ' + prompt.substring(0, 4)
            },
            activeTab: 1 
          })
          
          // 预下载图片到本地临时路径，确保后续 canvas 绘图保存时不报跨域错或过期错误
          wx.downloadFile({
            url: result.imageUrl,
            success: (downloadRes) => {
              if (downloadRes.statusCode === 200) {
                // 更新 value 为本地临时路径
                const bg = this.data.selectedBg;
                bg.value = downloadRes.tempFilePath;
                bg.css = `url(${downloadRes.tempFilePath})`;
                this.setData({ selectedBg: bg });
              }
            }
          })
          
        } else {
          console.error("生成失败:", result);
          wx.showToast({ title: '生成失败请重试', icon: 'none' })
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error("调用失败:", err)
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  }
})
