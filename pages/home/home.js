Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    greeting: '早上好',
    dateText: '',
    weather: {
      temp: '24°C',
      desc: '晴朗',
      icon: '☀️',
      advice: '微凉，建议搭配薄外套'
    },
    todayPicks: []
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
    this.initDateAndGreeting();
    this.fetchTodayPicks();
  },
  initDateAndGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '早上好';
    if (hour >= 12 && hour < 18) greeting = '下午好';
    else if (hour >= 18) greeting = '晚上好';
    
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const day = days[now.getDay()];
    
    this.setData({
      greeting,
      dateText: `${month}月${date}日 星期${day}`
    });
  },
  fetchTodayPicks() {
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: { type: 'getRandomItems' }
    }).then(res => {
      if (res.result && res.result.success && res.result.data.length > 0) {
        // Randomly select 2-3 items
        const allItems = res.result.data;
        const shuffled = allItems.sort(() => 0.5 - Math.random());
        const picks = shuffled.slice(0, 3).map(item => ({
          id: item._id,
          title: item.name || '未命名单品',
          image: item.image_url,
          category: item.category
        }));
        this.setData({ todayPicks: picks });
      }
    }).catch(err => console.error(err));
  },
  goToCanvas() {
    wx.navigateTo({ url: '/pages/canvas/canvas' });
  },
  goToAdd() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      itemColor: '#7C3AED',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.goPhotograph();
        } else {
          this.goPhotoalbum();
        }
      }
    });
  },
  goPhotograph() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        wx.navigateTo({ url: `/pages/edit/edit?path=${encodeURIComponent(res.tempFiles[0].tempFilePath)}` });
      }
    });
  },
  goPhotoalbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        wx.navigateTo({ url: `/pages/edit/edit?path=${encodeURIComponent(res.tempFiles[0].tempFilePath)}` });
      }
    });
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` });
  },
  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  }
});
