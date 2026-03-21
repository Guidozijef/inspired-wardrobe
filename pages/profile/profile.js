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
    // 扭蛋机主数据
    allTops: [],
    allBottoms: [],
    allShoes: [],
    slot1Items: [], 
    slot2Items: [],
    slot3Items: [],
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
      this.prepareSlotItems(); // 准备扭蛋机单品
    });
  },

  // 获取并缓存所有单品数据
  prepareSlotItems() {
    console.log('正在拉取全量衣橱数据用于扭蛋机...');
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: { type: 'getRandomItems' }
    }).then(res => {
      if (res.result && res.result.success) {
        const all = res.result.data || [];
        if (all.length === 0) return;

        // 分类提取并存储全量数据
        const tops = all.filter(i => i.category === '上装').map(i => ({ url: i.image_url, name: i.name }));
        const bottoms = all.filter(i => i.category === '下装').map(i => ({ url: i.image_url, name: i.name }));
        const shoes = all.filter(i => i.category === '鞋履').map(i => ({ url: i.image_url, name: i.name }));
        
        // 如果分类为空，则用其他衣服充当
        const allMapped = all.map(i => ({ url: i.image_url, name: i.name }));
        
        this.setData({
          allTops: tops.length > 0 ? tops : allMapped,
          allBottoms: bottoms.length > 0 ? bottoms : allMapped,
          allShoes: shoes.length > 0 ? shoes : allMapped
        }, () => {
          // 初始化首屏显示的 10 个展示位（随机展示一些）
          this.refreshSlotDisplay();
        });
      }
    }).catch(err => {
      console.error('获取全量单品异常:', err);
    });
  },

  // 刷新滚筒上显示的 10 个占位物品（为了动画效果）
  refreshSlotDisplay() {
    const { allTops, allBottoms, allShoes } = this.data;
    const getRandomSub = (list) => {
      let sub = [];
      for(let i=0; i<10; i++) {
        sub.push(list[Math.floor(Math.random() * list.length)]);
      }
      return sub;
    };

    if (allTops.length > 0) {
      this.setData({
        slot1Items: getRandomSub(allTops),
        slot2Items: getRandomSub(allBottoms),
        slot3Items: getRandomSub(allShoes)
      });
    }
  },

  onShow() {
    this.fetchOutfits();
  },

  // 灵感扭蛋机逻辑：点击时从全量数据中“真随机”抽取
  generateRandomLook() {
    if (this.data.isGenerating) return;
    const { allTops, allBottoms, allShoes } = this.data;
    if (allTops.length === 0) {
      wx.showToast({ title: '衣橱还是空的哦', icon: 'none' });
      return;
    }

    // 1. 从全量库里先选出本次“中奖”的单品
    const targetTop = allTops[Math.floor(Math.random() * allTops.length)];
    const targetBottom = allBottoms[Math.floor(Math.random() * allBottoms.length)];
    const targetShoes = allShoes[Math.floor(Math.random() * allShoes.length)];

    // 2. 随机生成停止位置 (0-9 之间，建议选 5-9 增加滚动感，但逻辑上 0-9 均可)
    const stopIdx1 = Math.floor(Math.random() * 5) + 4; // 比如停在 4-8 位
    const stopIdx2 = Math.floor(Math.random() * 5) + 4;
    const stopIdx3 = Math.floor(Math.random() * 5) + 4;

    // 3. 将中奖单品悄悄安插到展示列表对应的位置（这时转盘还没转，或者正在加速）
    const slot1 = [...this.data.slot1Items];
    const slot2 = [...this.data.slot2Items];
    const slot3 = [...this.data.slot3Items];
    
    slot1[stopIdx1] = targetTop;
    slot2[stopIdx2] = targetBottom;
    slot3[stopIdx3] = targetShoes;

    this.setData({
      isGenerating: true,
      slot1Items: slot1,
      slot2Items: slot2,
      slot3Items: slot3
    });

    // 4. 等待 1.5s 动画，然后停止到目标点
    setTimeout(() => {
      const titles = ['今日通勤推荐', '周末休闲风', '运动活力装', '约会晚宴风'];
      this.setData({
        isGenerating: false,
        slot1Index: stopIdx1,
        slot2Index: stopIdx2,
        slot3Index: stopIdx3,
        randomLook: { title: titles[Math.floor(Math.random() * titles.length)] }
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
