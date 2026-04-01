Page({
  data: {
    isLoading: true,
    userStats: { clothesCount: 0, outfitCount: 0 },
    categoryStats: [],
    colorStats: [],
    topPicks: []
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
        if (data.colorStats && data.colorStats.length > 0) {
          maxColorCount = data.colorStats[0].count;
        }
        const colorStats = (data.colorStats || []).map(item => ({
          ...item,
          percent: Math.floor((item.count / maxColorCount) * 100)
        }));

        this.setData({
          userStats: data.userStats || { clothesCount: 0, outfitCount: 0 },
          categoryStats: data.categoryStats || [],
          colorStats: colorStats,
          topPicks: data.topPicks || [],
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
