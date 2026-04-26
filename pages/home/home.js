Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    greeting: '早上好',
    dateText: '',
    weather: {
      temp: '--°C',
      desc: '加载中...',
      icon: '☁️',
      advice: '正在获取天气信息...',
      location: '定位中...'
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
    this.fetchWeather();
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
  
  fetchWeather() {
    // 优先尝试获取手机 GPS 定位 (使用模糊定位，更容易通过审核)
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.callWeatherCloudFunction(res.latitude, res.longitude);
      },
      fail: (err) => {
        console.warn('获取 GPS 定位失败，降级使用 IP 定位', err);
        // 如果用户拒绝授权或获取失败，降级使用原有的 IP 定位
        this.callWeatherCloudFunction();
      }
    });
  },
  
  callWeatherCloudFunction(lat, lon) {
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: { 
        type: 'getWeather',
        lat: lat,
        lon: lon
      }
    }).then(res => {
      console.log(res)
      if (res.result && res.result.success && res.result.weather) {
        const live = res.result.weather;
        const city = res.result.location;
        
        const weatherDesc = live.weather;
        let icon = '☁️';
        let advice = '舒适，可自由穿搭';
        
        if (weatherDesc.includes('晴')) { icon = '☀️'; advice = '阳光明媚，注意防晒'; }
        else if (weatherDesc.includes('雨')) { icon = '🌧️'; advice = '有雨，出门记得带伞'; }
        else if (weatherDesc.includes('阴')) { icon = '☁️'; advice = '多云转阴，温度适宜'; }
        else if (weatherDesc.includes('雪')) { icon = '❄️'; advice = '下雪啦，注意保暖'; }
        
        const temp = parseInt(live.temperature);
        if (temp < 10) advice = '天气寒冷，建议穿厚外套/羽绒服';
        else if (temp >= 10 && temp < 20) advice = '微凉，建议搭配薄外套/卫衣';
        else if (temp >= 20 && temp < 28) advice = '温度适宜，适合穿衬衫/T恤';
        else if (temp >= 28) advice = '天气炎热，建议穿轻薄透气的夏装';

        this.setData({
          weather: {
            temp: `${live.temperature}°C`,
            desc: live.weather,
            icon: icon,
            advice: advice,
            location: city
          }
        });
      } else {
        this.setData({ 'weather.location': '定位失败' });
      }
    }).catch(err => {
      console.error('获取天气云函数调用失败:', err);
      this.setData({ 'weather.location': '网络错误' });
    });
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
  },

  onShareAppMessage() {
    return {
      title: 'AI灵感衣橱 - 你的私人穿搭管家',
      path: '/pages/home/home',
      imageUrl: '/assets/logo.png' // 可选，如果项目里有合适的海报可以换成相应的图片
    };
  },

  onShareTimeline() {
    return {
      title: 'AI灵感衣橱 - 你的私人穿搭管家'
    };
  }
});
