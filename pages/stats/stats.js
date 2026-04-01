Page({
  data: {
    isLoading: true,
    userStats: { clothesCount: 0, outfitCount: 0 },
    categoryStats: [],
    colorStats: [],
    topPicks: [],
    dustyPicks: [],
    pieChartStyle: '',
    colorInsight: ''
  },

  onLoad() {
    this.fetchStats();
  },

  fetchStats() {
    this.setData({ isLoading: true });
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: { type: 'getWardrobeStats' }
    }).then(res => {
      if (res.result && res.result.success) {
        const data = res.result.data || {};
        
        // 处理颜色分布宽度比例
        let maxColorCount = 1;
        let totalColors = 0;
        if (data.colorStats && data.colorStats.length > 0) {
          maxColorCount = data.colorStats[0].count;
          totalColors = data.colorStats.reduce((sum, c) => sum + c.count, 0);
        }
        
        let currentAngle = 0;
        const colorStats = (data.colorStats || []).map(item => {
          const percent = totalColors > 0 ? (item.count / totalColors) * 100 : 0;
          const start = currentAngle;
          const end = currentAngle + percent;
          currentAngle = end;
          return {
            ...item,
            percent: Math.floor((item.count / maxColorCount) * 100), // Bar width
            pieStop: `${item._id} ${start}% ${end}%` // For conic gradient
          };
        });

        const conicStops = colorStats.map(c => c.pieStop).join(', ');
        const pieChartStyle = conicStops ? `conic-gradient(${conicStops})` : '';

        let colorInsight = '你的衣橱色彩非常丰富。';
        if (colorStats.length > 0 && totalColors > 0) {
          const topPercent = Math.round((colorStats[0].count / totalColors) * 100);
          if (topPercent >= 40) {
            colorInsight = `你的审美非常专一，高达 ${topPercent}% 的单品是这个色调。`;
          } else {
            colorInsight = `色彩分布均匀多元，最多的是占比 ${topPercent}% 的色系。`;
          }
        }

        const validTopPicks = (data.topPicks || [])
          .filter(item => item.clothInfo && item.clothInfo.length > 0)
          .slice(0, 5)
          .map(item => {
            const priceStr = item.clothInfo[0].price;
            let price = 0;
            if (priceStr && !isNaN(Number(priceStr))) {
              price = Number(priceStr);
            }
            let cpw = 0;
            if (price > 0) {
              cpw = (price / item.wearCount).toFixed(1);
            }
            return {
              ...item,
              price,
              cpw
            }
          });

        const dustyPicks = (data.dustyPicks || []).map(item => {
          const d = new Date(item.create_time);
          const diffTime = Math.abs(new Date() - d);
          const idleDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return {
            ...item,
            idleDays
          }
        });

        this.setData({
          userStats: data.userStats || { clothesCount: 0, outfitCount: 0 },
          categoryStats: data.categoryStats || [],
          colorStats: colorStats,
          topPicks: validTopPicks,
          dustyPicks: dustyPicks,
          pieChartStyle,
          colorInsight,
          isLoading: false
        });
      } else {
        this.setData({ isLoading: false });
      }
    }).catch(err => {
      console.error('统计获取失败', err);
      this.setData({ isLoading: false });
    });
  }
});
