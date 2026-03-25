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
    // 扭蛋机主数据
    allOutfits: [],
    slotItems: [], 
    slotIndex: 0,
    isGenerating: false,
    randomLook: null
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
      this.prepareSlotItems();
    });
  },

  onShow() {
    this.fetchOutfits();
  },

  // 获取并缓存所有穿搭数据
  prepareSlotItems() {
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { type: 'getOutfits', data: { page: 0, pageSize: 100 } }
    }).then(res => {
      if (res.result && res.result.success) {
        const allOutfits = res.result.data || [];
        if (allOutfits.length === 0) {
          this.setData({ allOutfits: [], slotItems: [] });
          return;
        }

        const outfitsMapped = allOutfits
          .filter(i => i.preview_url)
          .map(i => ({ 
            url: i.preview_url, 
            name: i.title || '日常穿搭',
            id: i._id 
          }));
        
        this.setData({
          allOutfits: outfitsMapped
        }, () => {
          this.refreshSlotDisplay();
        });
      }
    });
  },

  refreshSlotDisplay() {
    const { allOutfits } = this.data;
    const getRandomSub = (list) => {
      let sub = [];
      for(let i=0; i<15; i++) {
        sub.push(list[Math.floor(Math.random() * list.length)]);
      }
      return sub;
    };

    if (allOutfits && allOutfits.length > 0) {
      this.setData({
        slotItems: getRandomSub(allOutfits)
      });
    }
  },

  generateRandomLook() {
    if (this.data.isGenerating) return;
    const { allOutfits } = this.data;
    if (!allOutfits || allOutfits.length === 0) {
      wx.showToast({ title: '还没有记录穿搭哦', icon: 'none' });
      return;
    }

    const targetOutfit = allOutfits[Math.floor(Math.random() * allOutfits.length)];

    const stopIdx = Math.floor(Math.random() * 5) + 5; // e.g., 5-9

    const slot = [...this.data.slotItems];
    
    slot[stopIdx] = targetOutfit;

    this.setData({
      isGenerating: true,
      slotItems: slot
    });

    setTimeout(() => {
      this.setData({
        isGenerating: false,
        slotIndex: stopIdx,
        randomLook: { title: targetOutfit.name }
      });
    }, 1500);
  },

  fetchOutfits() {
    const { year, month } = this.data;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: { type: 'getOutfits', data: { monthStr: monthStr } }
    }).then(res => {
      if (res.result && res.result.success) { this.processOutfits(res.result.data); }
    });
  },

  processOutfits(outfits) {
    const dailyLooks = {};
    if (outfits && outfits.length > 0) {
      outfits.forEach((item) => {
        const dStr = item.record_date;
        if (dStr) { dailyLooks[dStr] = item; }
      });
    }
    const activeDateStr = this.data.activeFullDate;
    this.setData({ 
      dailyLooks,
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

  shareWeiXin() {
    const { slotItems, slotIndex, allOutfits } = this.data;
    if (!allOutfits || allOutfits.length === 0) {
      wx.showToast({ title: '快去添加穿搭后再分享吧', icon: 'none' });
      return;
    }
    if (!slotItems.length || this.data.isGenerating) return;

    const selectedItems = [
      slotItems[slotIndex].url
    ];

    const itemsQuery = encodeURIComponent(selectedItems.join(','));
    wx.navigateTo({
      url: `/pages/share/share?items=${itemsQuery}&type=recommendation`
    });
  }
});
