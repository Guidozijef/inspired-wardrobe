import { takePhoto, chooseImage } from '../utils'
import { CATEGORIES, MATERIALS, PATTERNS, SIZES, BRANDS } from '../constants'

Page({
  data: {
    editingId: '',
    name: '',
    category: CATEGORIES[0],
    material: '',
    pattern: '',
    size: '',
    price: '',
    brand: '',
    note: '',
    showMore: false,

    materials: MATERIALS,
    patterns: PATTERNS,
    sizes: SIZES,
    brands: BRANDS,

    colors: [
      { hex: '#D4C4B7' },
      { hex: '#FFFFFF' },
      { hex: '#1A1A1A' }
    ],
    currImage: '',
    currFileID: '',
    activeColor: 0,

    colorPickerVisible: false,
    tempColor: '#FFFFFF',
    pickerRect: null,
    pickerX: 110,
    pickerY: 80,

    hasCutout: false,
    showLimitModal: false,

    seasons: [
      { name: '🌷 春季', active: false },
      { name: '☀️ 夏季', active: false },
      { name: '🍂 秋季', active: false },
      { name: '❄️ 冬季', active: false }
    ],
    occasions: [
      { name: '💼 职场通勤', active: false },
      { name: '💕 约会聚餐', active: false },
      { name: '🏖 周末休闲', active: false },
      { name: '📷 逛街拍照', active: false },
      { name: '✈️ 旅行度假', active: false },
      { name: '🏃 运动出汗', active: false },
      { name: '🎉 聚会派对', active: false },
      { name: '🛋 居家睡衣', active: false },
      { name: '🎓 校园上课', active: false }
    ]
  },

  async onLoad(options) {
    if (options && options.path) {
      const localPath = decodeURIComponent(options.path)
      this.setData({ currImage: localPath })
      this.autoCutoutForNew(localPath)
    }

    if (options && options.id) {
      try {
        wx.showLoading({ title: '加载中...', mask: true })
        const res = await wx.cloud.callFunction({
          name: 'clothFunctions',
          data: {
            type: 'getClothDetail',
            data: { id: options.id }
          }
        })

        if (!res.result || !res.result.success) {
          throw new Error(res.result ? res.result.errMsg : '加载数据失败')
        }

        const item = res.result.data || {}
        const seasons = this.data.seasons.map((season) => ({
          ...season,
          active: Array.isArray(item.seasons) && item.seasons.includes(season.name)
        }))
        const occasions = this.data.occasions.map((occasion) => ({
          ...occasion,
          active: Array.isArray(item.occasions) && item.occasions.includes(occasion.name)
        }))
        const mainColor = item.color || '#FFFFFF'

        this.setData({
          editingId: options.id,
          name: item.name || '',
          category: item.category || CATEGORIES[0],
          material: item.material || '',
          pattern: item.pattern || '',
          size: item.size || '',
          price: item.price || '',
          brand: item.brand || '',
          note: item.note || '',
          currImage: item.image_url || '',
          currFileID: item.image_url || '',
          colors: [{ hex: mainColor }],
          activeColor: 0,
          seasons,
          occasions,
          hasCutout: !!item.image_url
        })
      } catch (error) {
        console.error('加载衣物详情失败', error)
        wx.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        wx.hideLoading()
      }
    }
  },

  onReady() {
    this.initColorCanvas()
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onPriceInput(e) {
    this.setData({ price: e.detail.value })
  },

  onBrandInput(e) {
    this.setData({ brand: e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  toggleTag(e) {
    const { type, val } = e.currentTarget.dataset
    if (!type) return
    this.setData({ [type]: val })
  },

  toggleMore() {
    this.setData({ showMore: !this.data.showMore })
  },

  goBack() {
    wx.navigateBack()
  },

  async autoCutoutForNew(localPath) {
    await this.processImageWithCutout(localPath)
  },

  async processImageWithCutout(localPath) {
    if (!localPath) return

    try {
      wx.showLoading({ title: 'AI 抠图中...', mask: true })

      const cloudPath = `temp/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: localPath
      })
      const originalFileID = uploadRes.fileID

      const cutoutRes = await wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: 'doCutout',
          data: { fileID: originalFileID }
        }
      })

      if (!cutoutRes.result || !cutoutRes.result.success) {
        throw new Error(cutoutRes.result ? cutoutRes.result.errMsg : '抠图失败')
      }

      if (cutoutRes.result.limitReached) {
        this.setData({
          currImage: localPath,
          currFileID: originalFileID,
          hasCutout: false,
          showLimitModal: true
        })
        return
      }

      wx.showLoading({ title: '正在优化裁剪...', mask: true })
      const cutoutFileID = cutoutRes.result.fileID
      const croppedFilePath = await this.autoCropImage(cutoutFileID)

      const finalCloudPath = `clothes/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`
      const finalUploadRes = await wx.cloud.uploadFile({
        cloudPath: finalCloudPath,
        filePath: croppedFilePath
      })

      this.setData({
        currImage: finalUploadRes.fileID,
        currFileID: finalUploadRes.fileID,
        hasCutout: true
      })
    } catch (error) {
      console.error('AI 抠图失败', error)
      const errorMsg = error.message || error.errMsg || '抠图失败，请重试'
      wx.showToast({ title: errorMsg, icon: 'none' })
      this.setData({
        currImage: localPath,
        hasCutout: false
      })
    } finally {
      wx.hideLoading()
    }
  },

  async autoCropImage(fileID) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: fileID,
        success: (imgInfo) => {
          const query = wx.createSelectorQuery().in(this)
          query.select('#processCanvas').node().exec((res) => {
            if (!res[0] || !res[0].node) {
              reject(new Error('未找到处理画布'))
              return
            }

            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            const { width, height } = imgInfo
            canvas.width = width
            canvas.height = height

            const img = canvas.createImage()
            img.onload = () => {
              ctx.clearRect(0, 0, width, height)
              ctx.drawImage(img, 0, 0, width, height)

              const imageData = ctx.getImageData(0, 0, width, height)
              const data = imageData.data

              let minX = width
              let minY = height
              let maxX = 0
              let maxY = 0
              let found = false

              for (let y = 0; y < height; y += 1) {
                for (let x = 0; x < width; x += 1) {
                  const alpha = data[(y * width + x) * 4 + 3]
                  if (alpha > 10) {
                    minX = Math.min(minX, x)
                    minY = Math.min(minY, y)
                    maxX = Math.max(maxX, x)
                    maxY = Math.max(maxY, y)
                    found = true
                  }
                }
              }

              if (!found) {
                resolve(imgInfo.path)
                return
              }

              const cropW = maxX - minX + 1
              const cropH = maxY - minY + 1
              const offCanvas = wx.createOffscreenCanvas({ type: '2d', width: cropW, height: cropH })
              const offCtx = offCanvas.getContext('2d')
              offCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH)

              wx.canvasToTempFilePath({
                canvas: offCanvas,
                destWidth: cropW,
                destHeight: cropH,
                success: (fileRes) => resolve(fileRes.tempFilePath),
                fail: reject
              })
            }
            img.onerror = () => reject(new Error('图片加载到画布失败'))
            img.src = imgInfo.path
          })
        },
        fail: () => reject(new Error('获取图片信息失败'))
      })
    })
  },

  async saveItem() {
    const { editingId, name, category, colors, activeColor, seasons, occasions, currImage, currFileID } = this.data

    if (!currImage) {
      wx.showToast({ title: '请先上传图片', icon: 'none' })
      return
    }

    try {
      wx.showLoading({ title: '保存中...', mask: true })

      const activeSeasons = seasons.filter((item) => item.active).map((item) => item.name)
      const activeOccasions = occasions.filter((item) => item.active).map((item) => item.name)
      const mainColor = colors[activeColor] ? colors[activeColor].hex : ''
      const isEdit = !!editingId

      const dbRes = await wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: isEdit ? 'updateCloth' : 'addCloth',
          data: {
            id: editingId,
            fileID: currFileID,
            name: name || '未命名衣物',
            category,
            material: this.data.material,
            pattern: this.data.pattern,
            size: this.data.size,
            price: this.data.price,
            brand: this.data.brand,
            note: this.data.note,
            seasons: activeSeasons,
            occasions: activeOccasions,
            color: mainColor
          }
        }
      })

      if (dbRes.result && dbRes.result.success) {
        wx.showToast({
          title: isEdit ? '更新成功' : '添加成功',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else {
        const errMsg = dbRes.result ? dbRes.result.errMsg : '保存失败'
        wx.showToast({ title: errMsg, icon: 'none' })
      }
    } catch (error) {
      console.error('保存单品失败', error)
      wx.showToast({ title: error.message || '系统错误', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  async deleteItem() {
    const { editingId } = this.data
    if (!editingId) return

    wx.showModal({
      title: '提示',
      content: '确定要将这件衣服从衣橱中移除吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return

        try {
          wx.showLoading({ title: '正在删除...', mask: true })
          const dbRes = await wx.cloud.callFunction({
            name: 'clothFunctions',
            data: {
              type: 'deleteCloth',
              data: { id: editingId }
            }
          })

          if (dbRes.result && dbRes.result.success) {
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1000)
          } else {
            const errMsg = dbRes.result ? dbRes.result.errMsg : '删除失败'
            wx.showToast({ title: errMsg, icon: 'none' })
          }
        } catch (error) {
          console.error('删除单品失败', error)
          wx.showToast({ title: '系统错误', icon: 'none' })
        } finally {
          wx.hideLoading()
        }
      }
    })
  },

  reupload() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: async (res) => {
        let tempFilePath = ''

        try {
          if (res.tapIndex === 0) {
            tempFilePath = await takePhoto()
          } else if (res.tapIndex === 1) {
            tempFilePath = await chooseImage()
          }

          if (tempFilePath) {
            this.processImageWithCutout(tempFilePath)
          }
        } catch (error) {
          console.error('选择图片失败', error)
        }
      }
    })
  },

  selectCategory() {
    wx.showActionSheet({
      itemList: CATEGORIES,
      success: (res) => {
        this.setData({ category: CATEGORIES[res.tapIndex] })
      }
    })
  },

  switchColor(e) {
    this.setData({ activeColor: e.currentTarget.dataset.index })
  },

  addColor() {
    this.setData({ colorPickerVisible: true })
    this.initColorCanvas()
  },

  initColorCanvas() {
    const query = wx.createSelectorQuery().in(this)
    query
      .select('#color-picker-canvas')
      .boundingClientRect((rect) => {
        if (!rect) return

        const ctx = wx.createCanvasContext('colorPickerCanvas', this)
        const { width, height } = rect
        const hueGrad = ctx.createLinearGradient(0, 0, width, 0)
        hueGrad.addColorStop(0, 'red')
        hueGrad.addColorStop(1 / 6, 'yellow')
        hueGrad.addColorStop(2 / 6, 'lime')
        hueGrad.addColorStop(3 / 6, 'cyan')
        hueGrad.addColorStop(4 / 6, 'blue')
        hueGrad.addColorStop(5 / 6, 'magenta')
        hueGrad.addColorStop(1, 'red')

        ctx.setFillStyle(hueGrad)
        ctx.fillRect(0, 0, width, height)
        ctx.draw(false, () => {
          this.setData({ pickerRect: rect })
        })
      })
      .exec()
  },

  onColorCanvasTouch(e) {
    const rect = this.data.pickerRect
    if (!rect) return

    const touch = e.touches[0] || e.changedTouches[0]
    if (!touch) return

    const x = Math.max(0, Math.min(rect.width - 1, touch.x))
    const y = Math.max(0, Math.min(rect.height - 1, touch.y))

    wx.canvasGetImageData({
      canvasId: 'colorPickerCanvas',
      x: Math.round(x),
      y: Math.round(y),
      width: 1,
      height: 1,
      success: (res) => {
        const [r, g, b] = res.data
        const toHex = (value) => {
          const hex = value.toString(16).toUpperCase()
          return hex.length === 1 ? `0${hex}` : hex
        }

        this.setData({
          tempColor: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
          pickerX: x - 6,
          pickerY: y - 6
        })
      }
    }, this)
  },

  cancelColorPick() {
    this.setData({ colorPickerVisible: false })
  },

  confirmColorPick() {
    const hex = this.data.tempColor
    const colors = this.data.colors.concat({ hex })
    this.setData({
      colors,
      activeColor: colors.length - 1,
      colorPickerVisible: false
    })
  },

  toggleSeason(e) {
    const index = e.currentTarget.dataset.index
    const seasons = this.data.seasons.map((item, itemIndex) => (
      itemIndex === index ? { ...item, active: !item.active } : item
    ))
    this.setData({ seasons })
  },

  toggleOccasion(e) {
    const index = e.currentTarget.dataset.index
    const occasions = this.data.occasions.map((item, itemIndex) => (
      itemIndex === index ? { ...item, active: !item.active } : item
    ))
    this.setData({ occasions })
  },

  closeLimitModal() {
    this.setData({ showLimitModal: false })
  },

  stopTouchMove() {
    return false
  }
})
