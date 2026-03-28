Page({
  data: {
    loading: true,
    lookId: '',
    look: {},
    posterPath: '',
    displayImage: '',
    exportImage: '',
    previewImageHeight: 0,
    imageLoaded: false,
    displayTitle: '',
    serialText: '',
    subtitleText: '',
    appName: '灵感衣橱',
    appDesc: '发现穿搭灵感，让美触手可及',
    saveLabel: '保存到手机相册',
    friendLabel: '发送给好友',
    timelineLabel: '分享到朋友圈',
    emptyText: '正在加载图片...'
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
      const imgSrc = resolvedImage || rawImage

      // 提前获取图片尺寸，预设容器高度，防止加载时布局跳闪
      const imgInfo = await this.getImageInfo(imgSrc)
      let previewImageHeight = 0
      if (imgInfo && imgInfo.width && imgInfo.height) {
        const sysInfo = wx.getSystemInfoSync()
        const containerW = sysInfo.windowWidth - 68 // content padding 18×2 + card padding 16×2
        previewImageHeight = Math.round(containerW * imgInfo.height / imgInfo.width)
      }

      this.setData({
        look,
        displayImage: imgSrc,
        exportImage: imgSrc,
        previewImageHeight,
        imageLoaded: false,
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

  onImageLoad() {
    this.setData({ imageLoaded: true })
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
        const hdEnabled = wx.getStorageSync('setting_hd_export')
        const dpr = hdEnabled === false ? 1 : wx.getSystemInfoSync().pixelRatio

        // ── 布局常量 ──────────────────────────────────────
        const width    = 1080
        const margin   = 52      // 外边距（为边框留出空间）
        const cardPad  = 32      // 卡片内边距
        const cardR    = 0       // 卡片直角（配合 L 形边框）
        const imgR     = 0       // 图片直角
        const footerH  = 200     // footer 高度

        const previewX = margin + cardPad        // 84
        const previewY = margin + cardPad        // 84
        const previewW = width - 2 * previewX   // 912

        // 先获取图片尺寸
        const previewSrc = this.data.exportImage || this.data.displayImage
          || this.data.look.preview_url || this.data.look.preview
        let previewInfo = null
        if (previewSrc) previewInfo = await this.getImageInfo(previewSrc)

        const previewH = (previewInfo && previewInfo.width && previewInfo.height)
          ? Math.round(previewW * previewInfo.height / previewInfo.width)
          : 1200

        const footerY = previewY + previewH
        const cardW   = width - 2 * margin
        const cardH   = cardPad + previewH + footerH + cardPad
        const height  = 2 * margin + cardH         // 上下对称留边

        canvas.width  = width  * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // ── 1. 页面背景 ──────────────────────────────────
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
        bgGrad.addColorStop(0, '#fbfaff')
        bgGrad.addColorStop(1, '#f0eef9')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, width, height)

        // 顶部紫色光晕
        const radGrad = ctx.createRadialGradient(540, 0, 0, 540, 0, height * 0.4)
        radGrad.addColorStop(0, 'rgba(168, 124, 255, 0.16)')
        radGrad.addColorStop(1, 'rgba(168, 124, 255, 0)')
        ctx.fillStyle = radGrad
        ctx.fillRect(0, 0, width, height)

        // ── 2. 装饰边框（双线 + 四角 L 括号 + 品牌文字） ──────
        const fO   = 14    // 外线距画布边缘
        const fI   = 32    // 内线距画布边缘
        const cLen = 80    // L 臂长
        const cW   = 6     // L 线宽

        // 外细线（渐变紫）
        const outerGrad = ctx.createLinearGradient(fO, fO, width - fO, height - fO)
        outerGrad.addColorStop(0,   'rgba(143, 67, 246, 0.35)')
        outerGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.60)')
        outerGrad.addColorStop(1,   'rgba(143, 67, 246, 0.35)')
        ctx.strokeStyle = outerGrad
        ctx.lineWidth = 1.5
        ctx.strokeRect(fO, fO, width - fO * 2, height - fO * 2)

        // 内细线（渐变紫，稍深）
        const innerGrad = ctx.createLinearGradient(fI, fI, width - fI, height - fI)
        innerGrad.addColorStop(0,   'rgba(143, 67, 246, 0.30)')
        innerGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.50)')
        innerGrad.addColorStop(1,   'rgba(143, 67, 246, 0.30)')
        ctx.strokeStyle = innerGrad
        ctx.lineWidth = 1
        ctx.strokeRect(fI, fI, width - fI * 2, height - fI * 2)

        // 四角 L 标记（压在内线四角上，颜色更深）
        const drawCorner = (x, y, hx, hy) => {
          ctx.fillRect(hx > 0 ? x : x - cLen + cW, y, cLen, cW)
          ctx.fillRect(x, hy > 0 ? y : y - cLen + cW, cW, cLen)
        }
        ctx.fillStyle = 'rgba(143, 67, 246, 0.85)'
        drawCorner(fI,              fI,               1,  1)  // 左上
        drawCorner(width - fI - cW, fI,              -1,  1)  // 右上
        drawCorner(fI,              height - fI - cW, 1, -1)  // 左下
        drawCorner(width - fI - cW, height - fI - cW,-1, -1)  // 右下

        // ── 3. 卡片（白色，带阴影） ───────────────────────
        ctx.save()
        ctx.shadowColor  = 'rgba(90, 70, 140, 0.14)'
        ctx.shadowBlur   = 44
        ctx.shadowOffsetY = 20
        this.drawRoundedRect(ctx, margin, margin, cardW, cardH, cardR)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        ctx.fill()
        ctx.restore()

        // ── 4. 图片（上两角圆、下两角直） ───────────────────
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(previewX + imgR, previewY)
        ctx.lineTo(previewX + previewW - imgR, previewY)
        ctx.arcTo(previewX + previewW, previewY,   previewX + previewW, previewY + imgR, imgR)
        ctx.lineTo(previewX + previewW, previewY + previewH)
        ctx.lineTo(previewX,            previewY + previewH)
        ctx.lineTo(previewX,            previewY + imgR)
        ctx.arcTo(previewX, previewY, previewX + imgR, previewY, imgR)
        ctx.closePath()
        ctx.clip()

        if (previewInfo && previewInfo.path) {
          try {
            const previewImg = canvas.createImage()
            await this.loadCanvasImage(previewImg, previewInfo.path)
            ctx.drawImage(previewImg, previewX, previewY, previewW, previewH)
          } catch (e) {
            this.fillPosterPlaceholder(ctx, previewX, previewY, previewW, previewH)
          }
        } else {
          this.fillPosterPlaceholder(ctx, previewX, previewY, previewW, previewH)
        }
        ctx.restore()

        // ── 5. 图片底部渐变遮罩 + 文字 ───────────────────
        const oTop    = previewY + previewH * 0.45
        const oBottom = previewY + previewH
        const ovGrad  = ctx.createLinearGradient(0, oTop, 0, oBottom)
        ovGrad.addColorStop(0, 'rgba(0,0,0,0)')
        ovGrad.addColorStop(1, 'rgba(0,0,0,0.44)')
        ctx.fillStyle = ovGrad
        ctx.beginPath()
        ctx.moveTo(previewX + imgR, previewY)
        ctx.lineTo(previewX + previewW - imgR, previewY)
        ctx.arcTo(previewX + previewW, previewY,   previewX + previewW, previewY + imgR, imgR)
        ctx.lineTo(previewX + previewW, oBottom)
        ctx.lineTo(previewX,            oBottom)
        ctx.lineTo(previewX,            previewY + imgR)
        ctx.arcTo(previewX, previewY, previewX + imgR, previewY, imgR)
        ctx.closePath()
        ctx.fill()

        const tx = previewX + 52
        ctx.fillStyle = 'rgba(255,255,255,0.68)'
        ctx.font = '500 26px sans-serif'
        ctx.fillText(this.data.serialText, tx, oBottom - 158)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 58px sans-serif'
        ctx.fillText(this.data.displayTitle || 'Inspired Look', tx, oBottom - 90)

        ctx.fillStyle = 'rgba(255,255,255,0.82)'
        ctx.font = 'italic 27px sans-serif'
        ctx.fillText(this.data.subtitleText, tx, oBottom - 40)

        // ── 6. Footer ────────────────────────────────────
        ctx.fillStyle = 'rgba(255,255,255,0.98)'
        ctx.fillRect(previewX, footerY, previewW, footerH)

        ctx.fillStyle = '#2C223D'
        ctx.font = 'bold 38px sans-serif'
        ctx.fillText(this.data.appName, previewX + 48, footerY + 82)

        ctx.fillStyle = '#8C86A3'
        ctx.font = '26px sans-serif'
        ctx.fillText(this.data.appDesc, previewX + 48, footerY + 128)

        try {
          const qrImg = canvas.createImage()
          await this.loadCanvasImage(qrImg, '/pages/images/qrX.jpg')
          const qrSize = 148
          ctx.drawImage(qrImg, previewX + previewW - qrSize - 44, footerY + (footerH - qrSize) / 2, qrSize, qrSize)
        } catch (e) {
          console.error('load qr failed', e)
        }

        // ── 7. 品牌文字（footer 之后绘制，不被卡片遮挡） ─────
        ctx.fillStyle = 'rgba(143, 67, 246, 0.52)'
        ctx.font = '500 26px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('✦  INSPIRED WARDROBE  ✦', width / 2, height - margin - 36)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'

        wx.canvasToTempFilePath({
          canvas,
          x: 0, y: 0,
          width:  canvas.width,
          height: canvas.height,
          destWidth:  canvas.width,
          destHeight: canvas.height,
          success: (r) => resolve(r.tempFilePath),
          fail: reject
        })
      })
    })
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
