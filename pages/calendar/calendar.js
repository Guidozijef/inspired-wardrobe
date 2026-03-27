Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    year: 2026,
    month: 2,
    days: [],
    activeFullDate: '',
    dailyLooks: {},
    currentDailyLook: null,
    allOutfits: [],
    slotItems: [],
    slotIndex: 0,
    isGenerating: false,
    randomLook: null
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    let menuButton = null
    try {
      menuButton = wx.getMenuButtonBoundingClientRect()
    } catch (e) {}

    const navBarHeight = menuButton ? (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height : 44
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      activeFullDate: todayStr
    }, () => {
      this.generateCalendar()
      this.prepareSlotItems()
    })
  },

  onShow() {
    this.fetchOutfits()
  },

  prepareSlotItems() {
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { type: 'getOutfits', data: { page: 0, pageSize: 100 } }
    }).then((res) => {
      if (!(res.result && res.result.success)) return

      const allOutfits = res.result.data || []
      if (allOutfits.length === 0) {
        this.setData({ allOutfits: [], slotItems: [] })
        return
      }

      const outfitsMapped = allOutfits
        .filter((item) => item.preview_url)
        .map((item) => ({
          url: item.preview_url,
          name: item.title || '日常穿搭',
          id: item._id
        }))

      this.setData({
        allOutfits: outfitsMapped
      }, () => {
        this.refreshSlotDisplay()
      })
    })
  },

  refreshSlotDisplay() {
    const { allOutfits } = this.data
    const getRandomSub = (list) => {
      const sub = []
      for (let i = 0; i < 15; i += 1) {
        sub.push(list[Math.floor(Math.random() * list.length)])
      }
      return sub
    }

    if (allOutfits && allOutfits.length > 0) {
      this.setData({
        slotItems: getRandomSub(allOutfits)
      })
    }
  },

  generateRandomLook() {
    if (this.data.isGenerating) return
    const { allOutfits } = this.data
    if (!allOutfits || allOutfits.length === 0) {
      wx.showToast({ title: '还没有记录穿搭哦', icon: 'none' })
      return
    }

    const targetOutfit = allOutfits[Math.floor(Math.random() * allOutfits.length)]
    const stopIdx = Math.floor(Math.random() * 5) + 5
    const slot = [...this.data.slotItems]
    slot[stopIdx] = targetOutfit

    this.setData({
      isGenerating: true,
      slotItems: slot
    })

    setTimeout(() => {
      this.setData({
        isGenerating: false,
        slotIndex: stopIdx,
        randomLook: {
          title: targetOutfit.name,
          id: targetOutfit.id
        }
      })
    }, 1500)
  },

  fetchOutfits() {
    const monthStr = `${this.data.year}-${String(this.data.month).padStart(2, '0')}`
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { type: 'getOutfits', data: { monthStr } }
    }).then((res) => {
      if (res.result && res.result.success) {
        this.processOutfits(res.result.data)
      }
    })
  },

  processOutfits(outfits) {
    const dailyLooks = {}
    if (outfits && outfits.length > 0) {
      outfits.forEach((item) => {
        if (item.record_date) {
          dailyLooks[item.record_date] = item
        }
      })
    }

    const activeDateStr = this.data.activeFullDate
    this.setData({
      dailyLooks,
      currentDailyLook: dailyLooks[activeDateStr] || null
    }, () => {
      this.generateCalendar()
    })
  },

  generateCalendar() {
    const { year, month, dailyLooks } = this.data
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const prevMonthDays = new Date(year, month - 1, 0).getDate()
    const days = []

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      days.push({ date: prevMonthDays - i, prev: true })
    }

    for (let i = 1; i <= daysInMonth; i += 1) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({ date: i, fullDate: dateStr, hasRecord: !!dailyLooks[dateStr] })
    }

    this.setData({ days })
  },

  prevMonth() {
    let { year, month } = this.data
    if (month === 1) {
      year -= 1
      month = 12
    } else {
      month -= 1
    }
    this.setData({ year, month }, () => {
      this.fetchOutfits()
    })
  },

  nextMonth() {
    let { year, month } = this.data
    if (month === 12) {
      year += 1
      month = 1
    } else {
      month += 1
    }
    this.setData({ year, month }, () => {
      this.fetchOutfits()
    })
  },

  selectDate(e) {
    if (e.currentTarget.dataset.prev) return
    const fullDate = e.currentTarget.dataset.fulldate
    this.setData({
      activeFullDate: fullDate,
      currentDailyLook: this.data.dailyLooks[fullDate] || null
    })
  },

  switchTab(e) {
    wx.redirectTo({ url: e.currentTarget.dataset.path })
  },

  goToRecord() {
    wx.redirectTo({ url: `/pages/canvas/canvas?date=${this.data.activeFullDate}` })
  },

  goToDetail() {
    if (this.data.currentDailyLook) {
      wx.navigateTo({ url: `/pages/look_detail/look_detail?id=${this.data.currentDailyLook._id}` })
    }
  },

  shareWeiXin() {
    const { slotItems, slotIndex, allOutfits, randomLook, isGenerating } = this.data
    if (!allOutfits || allOutfits.length === 0) {
      wx.showToast({ title: '快去添加穿搭后再打开哦', icon: 'none' })
      return
    }
    if (!slotItems.length || isGenerating) return

    const targetId = (randomLook && randomLook.id) || slotItems[slotIndex].id
    if (!targetId) {
      wx.showToast({ title: '暂时无法打开该穿搭', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: `/pages/look_detail/look_detail?id=${targetId}`
    })
  }
})
