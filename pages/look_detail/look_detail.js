Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    look: {
      id: '',
      title: '',
      date: '',
      emoji: '',
      bg: '#F3E8FF',
      items: [],
      preview: ''
    }
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    const menuButton = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    })

    if (options.id) {
      this.fetchDetail(options.id)
    }
  },

  fetchDetail(id) {
    wx.showLoading({ title: '\u52a0\u8f7d\u4e2d...', mask: true })
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: {
        type: 'getOutfitDetail',
        data: { id }
      }
    }).then((res) => {
      wx.hideLoading()
      if (res.result && res.result.success && res.result.data) {
        const data = res.result.data
        this.setData({
          look: {
            id: data._id,
            title: data.title || '\u6211\u7684\u7a7f\u642d',
            date: this.formatDate(data.create_time),
            emoji: '',
            bg: data.canvas_data ? data.canvas_data.background_color : '#F3E8FF',
            preview: data.preview_url,
            description: data.description,
            scene: data.scene,
            items: data.clothes_info ? data.clothes_info.map((item) => item.name || item.category) : []
          }
        })
      }
    }).catch((err) => {
      wx.hideLoading()
      console.error('fetch look detail failed', err)
      wx.showToast({ title: '\u52a0\u8f7d\u5931\u8d25', icon: 'none' })
    })
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  goBack() {
    wx.navigateBack()
  },

  shareImage() {
    if (this.data.look && this.data.look.id) {
      wx.navigateTo({ url: `/pages/share_preview/share_preview?id=${this.data.look.id}` })
      return
    }

    wx.showToast({ title: '\u65e0\u6cd5\u5206\u4eab\u8be5\u7a7f\u642d', icon: 'none' })
  },

  async deleteLook() {
    const id = this.data.look.id
    if (!id) return

    wx.showModal({
      title: '\u63d0\u793a',
      content: '\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u5957\u7a7f\u642d\u5417\uff1f',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return

        try {
          wx.showLoading({ title: '\u6b63\u5728\u5220\u9664...', mask: true })
          const dbRes = await wx.cloud.callFunction({
            name: 'outfitFunctions',
            data: {
              type: 'deleteOutfit',
              data: { id }
            }
          })

          wx.hideLoading()

          if (dbRes.result && dbRes.result.success) {
            wx.showToast({ title: '\u5df2\u5220\u9664', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1000)
            return
          }

          const errMsg = (dbRes.result && dbRes.result.errMsg) || '\u8bf7\u7a0d\u540e\u518d\u8bd5'
          wx.showToast({ title: `\u5220\u9664\u5931\u8d25\uff1a${errMsg}`, icon: 'none' })
        } catch (err) {
          wx.hideLoading()
          console.error('delete look failed', err)
          wx.showToast({ title: '\u7cfb\u7edf\u9519\u8bef', icon: 'none' })
        }
      }
    })
  },

  editLook() {
    if (this.data.look && this.data.look.id) {
      wx.redirectTo({
        url: `/pages/canvas/canvas?id=${this.data.look.id}&date=${this.data.look.date}`
      })
      return
    }

    wx.redirectTo({ url: '/pages/canvas/canvas' })
  }
})
