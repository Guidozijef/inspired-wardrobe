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
    fetchedCount: 0,
    latestDate: '无',
    capsules: [
      { id: 1, title: '五一去大理', count: 12, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop' },
      { id: 2, title: '下周打工装', count: 5, img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&h=200&fit=crop' }
    ],
    // 还原扭蛋机数据
    slot1Items: ['🧥', '👕', '🎽', '👔', '👗', '🧥', '👕', '🎽', '👔', '👗'],
    slot2Items: ['👖', '🩳', '👗', '👖', '🩳', '👖', '🩳', '👗', '👖', '🩳'],
    slot3Items: ['👟', '👞', '👠', '🥾', '👡', '👟', '👞', '👠', '🥾', '👡'],
    slot1Index: 0,
    slot2Index: 0,
    slot3Index: 0,
    isGenerating: false,
    randomLook: null,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    let menuButton = null;
    try {
      menuButton = wx.getMenuButtonBoundingClientRect();
    } catch (e) {}
    
    const navBarHeight = menuButton ? (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height : 44;
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: navBarHeight,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      activeFullDate: todayStr
    }, () => {
      this.generateCalendar();
    });
  },

  onShow() {
    this.fetchOutfits();
  },

  // 灵感扭蛋机逻辑
  generateRandomLook() {
    if (this.data.isGenerating) return;
    this.setData({ isGenerating: true });
    setTimeout(() => {
      const titles = ['今日通勤推荐', '周末休闲风', '运动活力装', '约会晚宴风'];
      const idx1 = Math.floor(Math.random() * 5);
      const idx2 = Math.floor(Math.random() * 5);
      const idx3 = Math.floor(Math.random() * 5);
      const randomTitleIdx = Math.floor(Math.random() * titles.length);
      this.setData({
        isGenerating: false,
        slot1Index: idx1,
        slot2Index: idx2,
        slot3Index: idx3,
        randomLook: { title: titles[randomTitleIdx] }
      });
    }, 1500);
  },

  fetchOutfits() {
    const { year, month } = this.data;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    wx.showLoading({ title: '加载中...', mask: true });
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { type: 'getOutfits', data: { monthStr: monthStr } }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) { this.processOutfits(res.result.data); }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取穿搭失败', err);
    });
  },

  processOutfits(outfits) {
    const dailyLooks = { ...this.data.dailyLooks };
    let latestDateStr = this.data.latestDate;
    if (outfits && outfits.length > 0) {
      outfits.forEach((item, index) => {
        const dStr = item.record_date;
        if (dStr) {
          if (index === 0 && (latestDateStr === '无' || dStr > latestDateStr)) { latestDateStr = dStr; }
          dailyLooks[dStr] = item;
        }
      });
    }
    const activeDateStr = this.data.activeFullDate;
    this.setData({ 
      dailyLooks,
      fetchedCount: Object.keys(dailyLooks).length,
      latestDate: latestDateStr,
      currentDailyLook: dailyLooks[activeDateStr] || null
    }, () => { this.generateCalendar(); });
  },

  generateCalendar() {
    const { year, month, dailyLooks } = this.data;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    let days = [];
    for (let i = firstDay - 1; i >= 0; i--) { days.push({ date: prevMonthDays - i, prev: true }); }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ date: i, fullDate: dateStr, hasRecord: !!dailyLooks[dateStr] });
    }
    this.setData({ days });
  },

  prevMonth() {
    let { year, month } = this.data;
    if (month === 1) { year--; month = 12; } else { month--; }
    this.setData({ year, month }, () => { this.fetchOutfits(); });
  },

  nextMonth() {
    let { year, month } = this.data;
    if (month === 12) { year++; month = 1; } else { month++; }
    this.setData({ year, month }, () => { this.fetchOutfits(); });
  },

  selectDate(e) {
    if (!e.currentTarget.dataset.prev) {
      const fullDate = e.currentTarget.dataset.fulldate;
      this.setData({ activeFullDate: fullDate, currentDailyLook: this.data.dailyLooks[fullDate] || null });
    }
  },

  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  },

  goToRecord() {
    wx.redirectTo({ url: `/pages/canvas/canvas?date=${this.data.activeFullDate}` });
  },

  goToDetail() {
    if (this.data.currentDailyLook) {
      wx.navigateTo({ url: `/pages/look_detail/look_detail?id=${this.data.currentDailyLook._id}` });
    }
  },

  // 分享功能
  shareWeiXin() {
    wx.showToast({ title: '分享功能准备中', icon: 'none' });
  }
});
