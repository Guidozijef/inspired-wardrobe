Page({
  data: {
    loading: true,
    lookId: '',
    look: {},
    posterPath: '',
    displayImage: '',
    exportImage: '',
    displayTitle: '',
    serialText: '',
    subtitleText: '',
    appName: '\u7075\u611f\u8863\u6a71',
    appDesc: '\u53d1\u73b0\u7a7f\u642d\u7075\u611f\uff0c\u8ba9\u7f8e\u89e6\u624b\u53ef\u53ca',
    saveLabel: '\u4fdd\u5b58\u5230\u624b\u673a\u76f8\u518c',
    friendLabel: '\u53d1\u9001\u7ed9\u597d\u53cb',
    timelineLabel: '\u5206\u4eab\u5230\u670b\u53cb\u5708',
    emptyText: '\u6b63\u5728\u52a0\u8f7d\u56fe\u7247...'
  },

  onLoad(options) {
    if (!options.id) {
      this.setData({
        loading: false,
        emptyText: '\u7f3a\u5c11\u7a7f\u642d\u4fe1\u606f'
      })
      wx.showToast({ title: '\u7f3a\u5c11\u7a7f\u642d\u4fe1\u606f', icon: 'none' })
      return
    }

    this.setData({ lookId: options.id })
    this.fetchDetail(options.id)
  },

  fetchDetail(id) {
    wx.showLoading({ title: '\u52a0\u8f7d\u4e2d...', mask: true })
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: {
        type: 'getOutfitDetail',
        data: { id }
      }
    }).then(async (res) => {
      wx.hideLoading()
      if (!res.result || !res.result.success || !res.result.data) {
        this.setData({
          loading: false,
          emptyText: '\u52a0\u8f7d\u5931\u8d25'
        })
        wx.showToast({ title: '\u52a0\u8f7d\u5931\u8d25', icon: 'none' })
        return
      }

      const look = res.result.data
      const rawImage = look.preview_url || look.preview || ''
      const resolvedImage = await this.resolvePreviewImage(look)
      console.log('share preview image source', {
        preview_url: look.preview_url,
        preview: look.preview,
        rawImage,
        resolvedImage
      })
      this.setData({
        look,
        displayImage: resolvedImage || rawImage,
        exportImage: resolvedImage || rawImage,
        displayTitle: look.title || 'Inspired Look',
        serialText: this.buildSerial(look._id || id),
        subtitleText: this.buildSubtitle(look.create_time)
      })

      this.buildPoster()
    }).catch((err) => {
      wx.hideLoading()
      this.setData({
        loading: false,
        emptyText: '\u52a0\u8f7d\u5931\u8d25'
      })
      console.error('fetch look detail failed', err)
      wx.showToast({ title: '\u52a0\u8f7d\u5931\u8d25', icon: 'none' })
    })
  },

  async buildPoster() {
    this.setData({ loading: true })
    try {
      const posterPath = await this.generatePoster()
      this.setData({
        posterPath,
        loading: false
      })
    } catch (err) {
      console.error('generate poster failed', err)
      this.setData({ loading: false })
    }
  },

  onShareAppMessage() {
    const { look, posterPath, lookId } = this.data
    return {
      title: look.title || '\u5206\u4eab\u4e00\u5957\u7a7f\u642d\u7ed9\u4f60',
      path: `/pages/look_detail/look_detail?id=${look._id || lookId}`,
      imageUrl: posterPath || this.data.displayImage || look.preview_url || look.preview || ''
    }
  },

  onShareTimeline() {
    const { look, posterPath, lookId } = this.data
    return {
      title: look.title || '\u5206\u4eab\u4e00\u5957\u7a7f\u642d\u7ed9\u4f60',
      query: `id=${look._id || lookId}`,
      imageUrl: posterPath || this.data.displayImage || look.preview_url || look.preview || ''
    }
  },

  async savePoster() {
    let filePath = this.data.posterPath

    if (!filePath) {
      try {
        filePath = await this.generatePoster()
        this.setData({ posterPath: filePath })
      } catch (err) {
        wx.showToast({ title: '\u751f\u6210\u5206\u4eab\u56fe\u5931\u8d25', icon: 'none' })
        return
      }
    }

    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.showToast({ title: '\u5df2\u4fdd\u5b58\u5230\u76f8\u518c', icon: 'success' })
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '\u9700\u8981\u6388\u6743',
            content: '\u8bf7\u5141\u8bb8\u4fdd\u5b58\u5230\u76f8\u518c\u540e\u518d\u8bd5\u4e00\u6b21',
            success: (res) => {
              if (res.confirm) wx.openSetting()
            }
          })
          return
        }

        wx.showToast({ title: '\u4fdd\u5b58\u5931\u8d25', icon: 'none' })
      }
    })
  },

  shareToMoments() {
    if (!this.data.posterPath) {
      wx.showToast({ title: '\u8bf7\u5148\u70b9\u4fdd\u5b58\u5230\u76f8\u518c', icon: 'none' })
      return
    }

    if (wx.showShareImageMenu) {
      try {
        wx.showShareImageMenu({ path: this.data.posterPath })
        return
      } catch (err) {
        console.error('open share image menu failed', err)
      }
    }

    wx.showModal({
      title: '\u5206\u4eab\u5230\u670b\u53cb\u5708',
      content: '\u5f53\u524d\u7248\u672c\u4e0d\u652f\u6301\u76f4\u63a5\u8c03\u8d77\u670b\u53cb\u5708\u56fe\u7247\u5206\u4eab\uff0c\u8bf7\u4f7f\u7528\u53f3\u4e0a\u89d2\u83dc\u5355\u7ee7\u7eed\u5206\u4eab\u3002',
      showCancel: false
    })
  },

  generatePoster() {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery()
      query.select('#posterCanvas').node().exec(async (res) => {
        if (!res[0] || !res[0].node) {
          reject(new Error('poster canvas not found'))
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        const width = 1080
        const previewX = 60
        const previewY = 60
        const previewW = 960
        const footerH = 220
        const radius = 58

        // 先获取图片尺寸，按原始比例计算 previewH
        const previewSrc = this.data.exportImage || this.data.displayImage || this.data.look.preview_url || this.data.look.preview
        let previewInfo = null
        if (previewSrc) {
          previewInfo = await this.getImageInfo(previewSrc)
        }

        const previewH = (previewInfo && previewInfo.width && previewInfo.height)
          ? Math.round(previewW * previewInfo.height / previewInfo.width)
          : 1220

        const footerY = previewY + previewH + 30
        const height = footerY + footerH + 60

        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const background = this.resolveBackground()
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, background.top)
        gradient.addColorStop(1, background.bottom)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        this.drawRoundedRect(ctx, previewX, previewY, previewW, previewH, radius)
        ctx.save()
        ctx.clip()

        if (previewInfo && previewInfo.path) {
          try {
            const previewImg = canvas.createImage()
            await this.loadCanvasImage(previewImg, previewInfo.path)
            ctx.drawImage(previewImg, previewX, previewY, previewW, previewH)
          } catch (err) {
            this.fillPosterPlaceholder(ctx, previewX, previewY, previewW, previewH)
          }
        } else {
          this.fillPosterPlaceholder(ctx, previewX, previewY, previewW, previewH)
        }

        ctx.restore()

        const overlayTop = previewY + previewH * 0.45
        const overlayBottom = previewY + previewH
        const overlay = ctx.createLinearGradient(0, overlayTop, 0, overlayBottom)
        overlay.addColorStop(0, 'rgba(0, 0, 0, 0)')
        overlay.addColorStop(1, 'rgba(0, 0, 0, 0.38)')
        ctx.fillStyle = overlay
        this.drawRoundedRect(ctx, previewX, previewY, previewW, previewH, radius)
        ctx.fill()

        ctx.fillStyle = 'rgba(255, 255, 255, 0.68)'
        ctx.font = '500 26px sans-serif'
        ctx.fillText(this.data.serialText, 116, overlayBottom - 160)

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 60px sans-serif'
        ctx.fillText(this.data.displayTitle || 'Inspired Look', 116, overlayBottom - 90)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
        ctx.font = 'italic 28px sans-serif'
        ctx.fillText(this.data.subtitleText, 116, overlayBottom - 38)

        this.drawRoundedRect(ctx, 60, footerY, 960, footerH, 46)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
        ctx.fill()

        ctx.fillStyle = '#2C223D'
        ctx.font = 'bold 38px sans-serif'
        ctx.fillText(this.data.appName, 110, footerY + 86)

        ctx.fillStyle = '#8C86A3'
        ctx.font = '26px sans-serif'
        ctx.fillText(this.data.appDesc, 110, footerY + 132)

        try {
          const qrImg = canvas.createImage()
          await this.loadCanvasImage(qrImg, '/pages/images/qrX.jpg')
          ctx.drawImage(qrImg, 860, footerY + 40, 110, 110)
        } catch (err) {
          console.error('load qr image failed', err)
        }

        wx.canvasToTempFilePath({
          canvas,
          x: 0,
          y: 0,
          width,
          height,
          destWidth: width,
          destHeight: height,
          success: (result) => resolve(result.tempFilePath),
          fail: reject
        })
      })
    })
  },

  resolveBackground() {
    const bgValue = this.data.look.canvas_data && this.data.look.canvas_data.background_color
    if (!bgValue) {
      return { top: '#F8F6FF', bottom: '#EEF2F9' }
    }

    return { top: bgValue, bottom: '#F5F5F7' }
  },

  buildSerial(id) {
    return `COLLECTION NO. ${String(id || this.data.lookId).slice(-3).padStart(3, '0')}`
  },

  buildSubtitle(createTime) {
    const seasonList = ['Spring Edit', 'Summer Edit', 'Autumn Edit', 'Winter Edit']
    const sourceDate = new Date(createTime || Date.now())
    const season = seasonList[Math.floor(sourceDate.getMonth() / 3)]
    return `Daily Look / ${season} '${String(sourceDate.getFullYear()).slice(-2)}`
  },

  getImageInfo(src) {
    return new Promise((resolve) => {
      wx.getImageInfo({
        src,
        success: resolve,
        fail: () => resolve(null)
      })
    })
  },

  async resolvePreviewImage(look) {
    const source = look.preview_url || look.preview || ''
    if (!source) return ''

    let resolvedSource = source

    if (source.indexOf('cloud://') === 0) {
      try {
        const res = await wx.cloud.getTempFileURL({
          fileList: [source]
        })
        const file = res.fileList && res.fileList[0]
        resolvedSource = file && file.tempFileURL ? file.tempFileURL : source
      } catch (err) {
        console.error('resolve cloud preview failed', err)
        resolvedSource = source
      }
    }

    if (/^https?:\/\//.test(resolvedSource)) {
      try {
        const tempFilePath = await this.downloadToTempFile(resolvedSource)
        return tempFilePath || resolvedSource
      } catch (err) {
        console.error('download preview image failed', err)
        return resolvedSource
      }
    }

    return resolvedSource
  },

  downloadToTempFile(url) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300 && res.tempFilePath) {
            resolve(res.tempFilePath)
            return
          }
          reject(new Error(`download failed: ${res.statusCode}`))
        },
        fail: reject
      })
    })
  },

  loadCanvasImage(img, src) {
    return new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  },

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.arcTo(x + width, y, x + width, y + radius, radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    ctx.lineTo(x + radius, y + height)
    ctx.arcTo(x, y + height, x, y + height - radius, radius)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
  },

fillPosterPlaceholder(ctx, x, y, width, height) {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
    gradient.addColorStop(0, '#F3EEE8')
    gradient.addColorStop(1, '#E8E1D8')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, width, height)
  }
})
