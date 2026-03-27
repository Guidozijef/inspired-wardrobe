import { WARDROBE_CATEGORIES } from '../constants'

const BACKGROUNDS = [
  { id: 'mini1', type: 'solid', value: '#FFFDF5', css: '#FFFDF5', label: '奶油白' },
  { id: 'mini2', type: 'solid', value: '#F5F5F7', css: '#F5F5F7', label: '极简灰' },
  { id: 'mini3', type: 'solid', value: '#E8EBE4', css: '#E8EBE4', label: '雾感绿' },
  { id: 'mini4', type: 'solid', value: '#F2E6E6', css: '#F2E6E6', label: '莫兰粉' },
  { id: 'mini5', type: 'gradient', colors: ['#F9F9F9', '#F1F1F1'], css: 'linear-gradient(180deg, #F9F9F9 0%, #F1F1F1 100%)', label: '极简渐变' },
  { id: 'mini6', type: 'gradient', colors: ['#FFFDF5', '#F5F0E6'], css: 'linear-gradient(135deg, #FFFDF5 0%, #F5F0E6 100%)', label: '柔和奶油' },
  { id: 'mini7', type: 'solid', value: '#EBDED5', css: '#EBDED5', label: '陶土色' },
  { id: 'mini9', type: 'solid', value: '#E5E5F2', css: '#E5E5F2', label: '淡雾紫' },
  { id: 'bg1', type: 'solid', value: '#F2F2F7', css: '#F2F2F7', label: '浅灰白' },
  { id: 'bg2', type: 'solid', value: '#FFFFFF', css: '#FFFFFF', label: '纯白' },
  { id: 'bg3', type: 'solid', value: '#FFE5E5', css: '#FFE5E5', label: '蜜桃粉' },
  { id: 'bg4', type: 'solid', value: '#E5F3FF', css: '#E5F3FF', label: '天青蓝' },
  { id: 'bg5', type: 'solid', value: '#E8FFE5', css: '#E8FFE5', label: '薄荷绿' },
  { id: 'bg6', type: 'solid', value: '#FFF5E5', css: '#FFF5E5', label: '奶杏色' },
  { id: 'bg7', type: 'solid', value: '#F3E5FF', css: '#F3E5FF', label: '浅紫雾' },
  { id: 'grad1', type: 'gradient', colors: ['#a18cd1', '#fbc2eb'], css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', label: '紫粉流光' },
  { id: 'grad2', type: 'gradient', colors: ['#ff9a9e', '#fecfef'], css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', label: '莓果雾粉' },
  { id: 'grad3', type: 'gradient', colors: ['#84fab0', '#8fd3f4'], css: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', label: '薄荷海盐' },
  { id: 'grad4', type: 'gradient', colors: ['#fccb90', '#d57eeb'], css: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', label: '日落紫霞' },
  { id: 'grad5', type: 'gradient', colors: ['#e0c3fc', '#8ec5fc'], css: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', label: '云雾蓝紫' },
  { id: 'grid1', type: 'solid', value: '#FFFFFF', css: 'linear-gradient(#F0F0F0 1px, transparent 1px), linear-gradient(90deg, #F0F0F0 1px, transparent 1px)', grid: true, label: '网格纸' },
  { id: 'grid2', type: 'solid', value: '#FFFFFF', css: 'radial-gradient(#D1D1D1 1.5px, transparent 1.5px)', dots: true, label: '点阵纸' },
  { id: 'img1', type: 'image', value: '/assets/backgrounds/bg_light_wood.png', css: 'url(/assets/backgrounds/bg_light_wood.png)', label: '浅木纹' },
  { id: 'img2', type: 'image', value: '/assets/backgrounds/bg_beige_linen.png', css: 'url(/assets/backgrounds/bg_beige_linen.png)', label: '亚麻布' },
  { id: 'img3', type: 'image', value: '/assets/backgrounds/bg_soft_marble.png', css: 'url(/assets/backgrounds/bg_soft_marble.png)', label: '柔和大理石' }
]

const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right']

Page({
  data: {
    tabs: ['单品库', '背景', '文字'],
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
    selectedBg: BACKGROUNDS.find((item) => item.id === 'bg1'),
    textAlignOptions: TEXT_ALIGN_OPTIONS,
    textColors: ['#000000', '#333333', '#8E8E93', '#FFFFFF', '#FF3B30', '#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#A2845E'],
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
    }
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
      const bgInfo = await new Promise((resolve) => {
        wx.getImageInfo({
          src: bg.value,
          success: resolve,
          fail: () => resolve(null)
        })
      })

      if (bgInfo && bgInfo.path) {
        const img = canvas.createImage()
        await new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          img.src = bgInfo.path
        })
        if (img.width) {
          ctx.drawImage(img, 0, 0, width, height)
          return
        }
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

  drawTextItems(ctx) {
    this.data.textItems.forEach((item) => {
      if (!String(item.content || '').trim()) return
      ctx.save()
      const box = this.estimateTextBox(item, ctx)
      const textX = item.align === 'center' ? item.x : item.align === 'right' ? item.x - 12 : item.x + 12
      const textY = item.y + 8

      ctx.translate(box.left + box.width / 2, box.top + box.height / 2)
      if (item.rotation) {
        ctx.rotate(item.rotation * Math.PI / 180)
      }
      ctx.font = `bold ${item.size}px sans-serif`
      ctx.fillStyle = item.color
      ctx.textBaseline = 'top'
      ctx.textAlign = item.align || 'left'
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

        const width = areaRect.width
        const height = areaRect.height

        this.setData({
          helperCanvasWidth: width,
          helperCanvasHeight: height
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

              canvas.width = width * dpr
              canvas.height = height * dpr
              ctx.setTransform(1, 0, 0, 1, 0, 0)
              ctx.scale(dpr, dpr)
              ctx.clearRect(0, 0, width, height)

              await this.drawBackground(ctx, canvas, width, height)

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

                const rectW = item.rect.width
                const rectH = item.rect.height
                const relativeX = item.rect.left - areaRect.left
                const relativeY = item.rect.top - areaRect.top
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

              this.drawTextItems(ctx)

              wx.canvasToTempFilePath({
                canvas,
                x: 0,
                y: 0,
                width,
                height,
                destWidth: width * dpr,
                destHeight: height * dpr,
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
  }
})
