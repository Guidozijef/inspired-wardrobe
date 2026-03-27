const DRAWER_TABS = ['background', 'text']
const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right']

Page({
  data: {
    look: {},
    drawerTabs: DRAWER_TABS,
    activeDrawerTab: 'background',
    textAlignOptions: TEXT_ALIGN_OPTIONS,
    backgrounds: [
      { id: 'mini1', type: 'solid', value: '#FFFDF5', css: '#FFFDF5', label: '奶油白' },
      { id: 'mini2', type: 'solid', value: '#F5F5F7', css: '#F5F5F7', label: '极简灰' },
      { id: 'mini3', type: 'solid', value: '#E8EBE4', css: '#E8EBE4', label: '雾感绿' },
      { id: 'mini4', type: 'solid', value: '#F2E6E6', css: '#F2E6E6', label: '莫兰迪粉' },
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
    ],
    selectedBg: { id: 'bg1', type: 'solid', value: '#F2F2F7', css: '#F2F2F7', label: '浅灰白' },
    textColors: ['#000000', '#333333', '#8E8E93', '#FFFFFF', '#FF3B30', '#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#A2845E'],
    textItems: [],
    nextTextId: 1,
    activeTextId: null,
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
    isMulti: false,
    imageUrls: []
  },

  onLoad(options) {
    this.pendingEditAction = null
    this.pendingActionTimer = null

    if (options.items) {
      const urls = decodeURIComponent(options.items).split(',')
      this.setData({
        isMulti: true,
        imageUrls: urls,
        look: {
          title: options.type === 'recommendation' ? '今日搭配灵感' : '我的灵感推荐',
          preview_url: urls[0]
        }
      })
    } else if (options.id) {
      this.fetchDetail(options.id)
    }
  },

  queueCanvasInputFocus() {
    if (this.canvasInputFocusTimer) {
      clearTimeout(this.canvasInputFocusTimer)
    }

    this.canvasInputFocusTimer = setTimeout(() => {
      this.setData({ canvasInputFocus: true })
      this.canvasInputFocusTimer = null
    }, 30)
  },

  clearCanvasInputFocusTimer() {
    if (this.canvasInputFocusTimer) {
      clearTimeout(this.canvasInputFocusTimer)
      this.canvasInputFocusTimer = null
    }
  },

  clearPendingActionTimer() {
    if (this.pendingActionTimer) {
      clearTimeout(this.pendingActionTimer)
      this.pendingActionTimer = null
    }
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

  openTextEditor(id) {
    const selectedItem = this.data.textItems.find((item) => item.id === id)
    const editingTextIndex = this.data.textItems.findIndex((item) => item.id === id)
    if (!selectedItem || editingTextIndex === -1) return

    const updatedItems = this.data.textItems.map((item) => ({
      ...item,
      active: item.id === id
    }))

    this.setData({
      textItems: updatedItems,
      activeTextId: id,
      editingTextId: id,
      editingTextIndex,
      activeTextDraft: selectedItem.content || '',
      activeDrawerTab: 'text',
      canvasInputFocus: false
    }, () => {
      this.queueCanvasInputFocus()
    })
  },

  handleCanvasTextPlacement(relX, relY) {
    const { activeTextId, activeTextDraft, textItems, nextTextId } = this.data

    if (activeTextId && !String(activeTextDraft || '').trim()) {
      const currentIndex = textItems.findIndex((item) => item.id === activeTextId)
      if (currentIndex !== -1) {
        this.setData({
          [`textItems[${currentIndex}].x`]: relX,
          [`textItems[${currentIndex}].y`]: relY,
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
      x: relX,
      y: relY,
      size: 24,
      color: '#333333',
      align: 'center',
      active: true
    }

    const updatedItems = textItems.map((item) => ({ ...item, active: false }))
    updatedItems.push(newItem)

    this.setData({
      textItems: updatedItems,
      nextTextId: nextTextId + 1,
      activeTextId: newItem.id,
      editingTextId: newItem.id,
      editingTextIndex: updatedItems.length - 1,
      activeTextDraft: '',
      activeDrawerTab: 'text',
      canvasInputFocus: false
    }, () => {
      this.queueCanvasInputFocus()
    })
  },

  removeTextById(id, callback) {
    const updatedItems = this.data.textItems.filter((item) => item.id !== id)
    const isActive = this.data.activeTextId === id
    const isEditing = this.data.editingTextId === id

    this.setData({
      textItems: updatedItems,
      activeTextId: isActive ? null : this.data.activeTextId,
      editingTextId: isEditing ? null : this.data.editingTextId,
      editingTextIndex: isEditing ? -1 : updatedItems.findIndex((item) => item.id === this.data.editingTextId),
      activeTextDraft: isActive ? '' : this.data.activeTextDraft,
      canvasInputFocus: isEditing ? false : this.data.canvasInputFocus
    }, callback)
  },

  noop() {},

  onUnload() {
    this.clearCanvasInputFocusTimer()
    this.clearPendingActionTimer()
  },

  fetchDetail(id) {
    wx.showLoading({ title: '加载中...', mask: true })
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: {
        type: 'getOutfitDetail',
        data: { id }
      }
    }).then((res) => {
      wx.hideLoading()
      if (res.result && res.result.success) {
        const data = res.result.data
        const initialBgColor = data.canvas_data ? data.canvas_data.background_color : '#F2F2F7'
        const matchedBg = this.data.backgrounds.find((bg) => bg.value === initialBgColor)
        const selectedBg = matchedBg || { id: 'bg_custom', type: 'solid', value: initialBgColor, css: initialBgColor, label: '自定义' }

        this.setData({
          look: data,
          selectedBg,
          backgrounds: matchedBg ? this.data.backgrounds : [selectedBg, ...this.data.backgrounds]
        })
      }
    }).catch((err) => {
      wx.hideLoading()
      console.error('获取搭配详情失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  goBack() {
    wx.navigateBack()
  },

  onShareAppMessage() {
    return {
      title: '发现一个超赞的穿搭灵感，快来看看！',
      path: `/pages/look_detail/look_detail?id=${this.data.look._id}`,
      imageUrl: this.data.look.preview_url
    }
  },

  switchDrawerTab(e) {
    const nextTab = e.currentTarget.dataset.tab

    if (nextTab === 'background') {
      this.setData({ activeDrawerTab: nextTab })
      this.deselectText()
      return
    }

    this.setData({
      activeDrawerTab: nextTab,
      editingTextId: this.data.activeTextId,
      editingTextIndex: this.data.textItems.findIndex((item) => item.id === this.data.activeTextId),
      canvasInputFocus: false
    }, () => {
      if (this.data.activeTextId) {
        this.queueCanvasInputFocus()
      }
    })
  },

  selectBg(e) {
    this.setData({ selectedBg: e.currentTarget.dataset.bg })
  },

  onActiveTextInput(e) {
    const activeTextDraft = e.detail.value
    const { editingTextId, textItems } = this.data
    const index = textItems.findIndex((item) => item.id === editingTextId)

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

  onCanvasTap(e) {
    if (this.data.activeDrawerTab !== 'text') {
      this.deselectText()
      return
    }

    const touchX = e.detail.x
    const touchY = e.detail.y

    wx.createSelectorQuery().select('#previewArea').boundingClientRect((rect) => {
      if (!rect) return

      const relX = Math.min(Math.max(touchX - rect.left, 24), rect.width - 24)
      const relY = Math.min(Math.max(touchY - rect.top - 18, 16), rect.height - 44)
      this.queuePendingEditAction({ type: 'canvas', x: relX, y: relY })
    }).exec()
  },

  activateText(e) {
    const id = e.currentTarget.dataset.id
    this.queuePendingEditAction({ type: 'edit', id })
  },

  deselectText() {
    this.clearCanvasInputFocusTimer()
    this.clearPendingActionTimer()
    this.pendingEditAction = null
    const { activeTextId, textItems } = this.data
    let updatedItems = textItems

    if (activeTextId) {
      updatedItems = textItems.filter((item) => {
        if (item.id !== activeTextId) {
          return true
        }
        return String(item.content || '').trim().length > 0
      })
    }

    updatedItems = updatedItems.map((item) => ({ ...item, active: false }))

    this.setData({
      textItems: updatedItems,
      activeTextId: null,
      editingTextId: null,
      editingTextIndex: -1,
      activeTextDraft: '',
      canvasInputFocus: false
    })
  },

  cancelTextEdit() {
    this.deselectText()
  },

  onCanvasTextBlur() {
    this.clearCanvasInputFocusTimer()
    const { editingTextId, textItems } = this.data
    if (!editingTextId) {
      this.setData({ canvasInputFocus: false }, () => {
        this.flushPendingEditAction()
      })
      return
    }

    const activeItem = textItems.find((item) => item.id === editingTextId)
    if (!activeItem || !String(activeItem.content || '').trim()) {
      this.removeTextById(editingTextId, () => {
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
    const color = e.currentTarget.dataset.color
    const { activeTextId, textItems } = this.data
    if (!activeTextId) return

    const index = textItems.findIndex((item) => item.id === activeTextId)
    if (index !== -1) {
      this.setData({
        [`textItems[${index}].color`]: color
      })
    }
  },

  changeTextSize(e) {
    const size = e.detail.value
    const { activeTextId, textItems } = this.data
    if (!activeTextId) return

    const index = textItems.findIndex((item) => item.id === activeTextId)
    if (index !== -1) {
      this.setData({
        [`textItems[${index}].size`]: size
      })
    }
  },

  changeTextAlign(e) {
    const align = e.currentTarget.dataset.align
    const { activeTextId, textItems } = this.data
    if (!activeTextId) return

    const index = textItems.findIndex((item) => item.id === activeTextId)
    if (index !== -1) {
      this.setData({
        [`textItems[${index}].align`]: align
      })
    }
  },

  onTextTouchStart(e) {
    const id = e.currentTarget.dataset.id
    const touch = e.touches[0]
    const item = this.data.textItems.find((textItem) => textItem.id === id)
    if (!item) return

    if (!item.active) {
      const updatedItems = this.data.textItems.map((i) => ({ ...i, active: i.id === id }))
      this.setData({
        textItems: updatedItems,
        activeTextId: id,
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

  onTextTouchEnd() {
    this.data.dragInfo = { id: null, startX: 0, startY: 0, initX: 0, initY: 0 }
  },

  onTextTouchMove(e) {
    const dragInfo = this.data.dragInfo
    if (!dragInfo.id) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragInfo.startX
    const deltaY = touch.clientY - dragInfo.startY
    const newX = dragInfo.initX + deltaX
    const newY = dragInfo.initY + deltaY
    const index = this.data.textItems.findIndex((item) => item.id === dragInfo.id)

    if (index !== -1) {
      this.setData({
        [`textItems[${index}].x`]: newX,
        [`textItems[${index}].y`]: newY
      })
    }
  },

  async saveImage() {
    this.deselectText()
    wx.showLoading({ title: '正在生成海报...', mask: true })

    try {
      const tempFilePath = await this.generateCanvasImage()
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          wx.hideLoading()
          wx.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: (err) => {
          wx.hideLoading()
          if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
            wx.showModal({
              title: '提示',
              content: '需要授权后才能保存到相册',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              }
            })
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        }
      })
    } catch (err) {
      wx.hideLoading()
      console.error('生成图片失败', err)
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
  },

  generateCanvasImage() {
    return new Promise((resolve, reject) => {
      const areaQuery = wx.createSelectorQuery()
      areaQuery.select('.canvas-area').boundingClientRect()

      areaQuery.exec(async (rects) => {
        const areaRect = rects[0]
        if (!areaRect) {
          reject(new Error('无法获取画板尺寸'))
          return
        }

        const width = areaRect.width
        const height = areaRect.height

        const canvasQuery = wx.createSelectorQuery()
        canvasQuery.select('#exportCanvas').node().exec(async (res) => {
          if (!res[0] || !res[0].node) {
            reject(new Error('未找到 Canvas 节点'))
            return
          }

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          const exportScale = 2
          const footerHeight = 100

          canvas.width = width * dpr * exportScale
          canvas.height = (height + footerHeight) * dpr * exportScale
          ctx.scale(dpr * exportScale, dpr * exportScale)

          const bg = this.data.selectedBg
          if (bg.type === 'gradient') {
            const grd = ctx.createLinearGradient(0, 0, width, height)
            grd.addColorStop(0, bg.colors[0])
            grd.addColorStop(1, bg.colors[1])
            ctx.fillStyle = grd
            ctx.fillRect(0, 0, width, height)
          } else if (bg.type === 'image') {
            try {
              const bgInfo = await new Promise((resolveBg) => {
                wx.getImageInfo({
                  src: bg.value,
                  success: resolveBg,
                  fail: () => resolveBg(null)
                })
              })
              if (bgInfo && bgInfo.path) {
                const bgImg = canvas.createImage()
                await new Promise((resolveLoad) => {
                  bgImg.onload = resolveLoad
                  bgImg.src = bgInfo.path
                })
                ctx.drawImage(bgImg, 0, 0, width, height)
              } else {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, width, height)
              }
            } catch (err) {
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(0, 0, width, height)
            }
          } else if (bg.grid) {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, height)
            ctx.strokeStyle = '#F0F0F0'
            ctx.lineWidth = 1
            const step = 20
            for (let x = 0; x <= width; x += step) {
              ctx.beginPath()
              ctx.moveTo(x, 0)
              ctx.lineTo(x, height)
              ctx.stroke()
            }
            for (let y = 0; y <= height; y += step) {
              ctx.beginPath()
              ctx.moveTo(0, y)
              ctx.lineTo(width, y)
              ctx.stroke()
            }
          } else if (bg.dots) {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, height)
            ctx.fillStyle = '#D1D1D1'
            const step = 20
            for (let x = 10; x <= width; x += step) {
              for (let y = 10; y <= height; y += step) {
                ctx.beginPath()
                ctx.arc(x, y, 1.5, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          } else {
            ctx.fillStyle = bg.value
            ctx.fillRect(0, 0, width, height)
          }

          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, height, width, footerHeight)

          ctx.strokeStyle = '#EEEEEE'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(0, height)
          ctx.lineTo(width, height)
          ctx.stroke()

          ctx.font = 'bold 16px sans-serif'
          ctx.fillStyle = '#333333'
          ctx.textBaseline = 'middle'
          ctx.fillText('灵感衣橱 | Inspired Wardrobe', 20, height + footerHeight / 2 - 8)

          ctx.font = '12px sans-serif'
          ctx.fillStyle = '#999999'
          ctx.fillText('发现穿搭灵感，让美触手可及', 20, height + footerHeight / 2 + 12)

          const qrSize = 80
          const qrX = width - qrSize - 20
          const qrY = height + (footerHeight - qrSize) / 2

          try {
            const qrImg = canvas.createImage()
            await new Promise((resolveLoad, rejectLoad) => {
              qrImg.onload = resolveLoad
              qrImg.onerror = rejectLoad
              qrImg.src = '/pages/images/qrX.jpg'
            })
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
          } catch (qrErr) {
            console.error('加载小程序码失败:', qrErr)
          }

          if (this.data.isMulti) {
            const spacing = 20
            let currentY = 25
            for (let i = 0; i < this.data.imageUrls.length; i += 1) {
              const url = this.data.imageUrls[i]
              try {
                const info = await new Promise((resolveImg) => {
                  wx.getImageInfo({ src: url, success: resolveImg, fail: () => resolveImg(null) })
                })

                if (info && info.path) {
                  const img = canvas.createImage()
                  await new Promise((resolveLoad) => {
                    img.onload = resolveLoad
                    img.src = info.path
                  })

                  const imgRatio = info.width / info.height
                  const drawW = width * 0.95
                  const drawH = drawW / imgRatio
                  const posX = (width - drawW) / 2

                  ctx.drawImage(img, posX, currentY, drawW, drawH)
                  currentY += drawH + spacing
                }
              } catch (error) {
                console.error('绘制多图失败:', error)
              }
            }
          } else if (this.data.look.preview_url) {
            try {
              const info = await new Promise((resolveImg) => {
                wx.getImageInfo({
                  src: this.data.look.preview_url,
                  success: resolveImg,
                  fail: () => resolveImg(null)
                })
              })

              if (info && info.path) {
                const img = canvas.createImage()
                await new Promise((resolveLoad) => {
                  img.onload = resolveLoad
                  img.src = info.path
                })

                const imgRatio = info.width / info.height
                const areaRatio = width / height
                let drawW
                let drawH
                let drawX
                let drawY

                if (imgRatio > areaRatio) {
                  drawW = width
                  drawH = width / imgRatio
                  drawX = 0
                  drawY = (height - drawH) / 2
                } else {
                  drawH = height
                  drawW = height * imgRatio
                  drawY = 0
                  drawX = (width - drawW) / 2
                }

                ctx.drawImage(img, drawX, drawY, drawW, drawH)
              }
            } catch (imgErr) {
              console.error('加载预览图失败', imgErr)
            }
          }

          for (let i = 0; i < this.data.textItems.length; i += 1) {
            const item = this.data.textItems[i]
            ctx.font = `bold ${item.size}px sans-serif`
            ctx.fillStyle = item.color
            ctx.textBaseline = 'top'
            ctx.textAlign = item.align || 'left'
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
            ctx.shadowBlur = 4
            ctx.shadowOffsetY = 1
            ctx.fillText(item.content, item.x + 12, item.y + 8)
            ctx.shadowColor = 'transparent'
            ctx.textAlign = 'left'
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
            fail: reject
          })
        })
      })
    })
  }
})
