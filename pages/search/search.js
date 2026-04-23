const SEASON_EMOJI_MAP = {
  春季: '🌷', 夏季: '☀️', 秋季: '🍂', 冬季: '❄️'
}

const OCCASION_EMOJI_MAP = {
  职场通勤: '💼', 约会聚餐: '💕', 周末休闲: '🏖',
  逛街拍照: '📷', 旅行度假: '✈️', 运动出汗: '🏃',
  聚会派对: '🎉', 居家睡衣: '🛋', 校园上课: '🎓'
}

function formatTagWithEmoji(value, emojiMap) {
  if (!value) return ''
  const normalizedValue = String(value).trim()
  const matchedKey = Object.keys(emojiMap).find((key) => (
    normalizedValue === key || normalizedValue.endsWith(` ${key}`)
  ))
  return matchedKey ? `${emojiMap[matchedKey]} ${matchedKey}` : normalizedValue
}

function formatSeasonIcon(value) {
  if (!value) return ''
  const normalizedValue = String(value).trim()
  const matchedKey = Object.keys(SEASON_EMOJI_MAP).find((key) => (
    normalizedValue === key || normalizedValue.endsWith(` ${key}`)
  ))
  return matchedKey ? SEASON_EMOJI_MAP[matchedKey] : normalizedValue
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    keyword: '',
    historyList: [],
    results: [],
    isSearching: false,
    page: 0,
    pageSize: 10,
    isLoading: false,
    isNoMore: false,
    loadedImages: {}
  },
  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
    
    // 加载历史记录
    const history = wx.getStorageSync('search_history') || [];
    this.setData({ historyList: history });
  },
  goBack() {
    wx.navigateBack();
  },
  onInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    if (!keyword.trim()) {
      this.setData({ isSearching: false, results: [] });
    }
  },
  onConfirm(e) {
    const keyword = e.detail.value || this.data.keyword;
    this.doSearch(keyword);
  },
  searchTag(e) {
    const keyword = e.currentTarget.dataset.tag;
    // 去除 emoji，保留文字部分
    const cleanKeyword = keyword.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]|[\u2600-\u2B55]\uFE0F?/g, '').trim();
    this.setData({ keyword: cleanKeyword });
    this.doSearch(cleanKeyword);
  },
  doSearch(keyword) {
    if (!keyword.trim()) return;
    
    // 保存历史记录
    let history = this.data.historyList;
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    if (history.length > 10) history = history.slice(0, 10);
    wx.setStorageSync('search_history', history);
    
    this.setData({
      historyList: history,
      isSearching: true,
      page: 0,
      results: [],
      isNoMore: false
    }, () => {
      this.fetchResults();
    });
  },
  fetchResults() {
    if (this.data.isLoading || this.data.isNoMore) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '搜索中...', mask: true });
    
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: {
        type: 'getClothes',
        data: {
          keyword: this.data.keyword,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      }
    }).then(res => {
      wx.hideLoading();
      this.setData({ isLoading: false });
      
      if (res.result && res.result.success) {
        const rawList = res.result.data || [];
        const isNoMore = rawList.length < this.data.pageSize;
        
        const newItems = rawList.map(item => {
          const originalSeasons = Array.isArray(item.seasons) ? item.seasons : [];
          const seasonIcons = originalSeasons.map(season => formatSeasonIcon(season)).filter(Boolean);
          const firstOccasion = Array.isArray(item.occasions) && item.occasions.length ? formatTagWithEmoji(item.occasions[0], OCCASION_EMOJI_MAP) : '';
          
          return {
            id: item._id,
            category: item.category || '',
            emoji: item.image_url || '',
            title: item.name || '未命名单品',
            desc: item.category || '',
            seasons: seasonIcons,
            tag: firstOccasion
          };
        });
        
        this.setData({
          results: [...this.data.results, ...newItems],
          page: this.data.page + 1,
          isNoMore
        });
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isLoading: false });
      console.error('搜索失败', err);
    });
  },
  onReachBottom() {
    if (this.data.isSearching) {
      this.fetchResults();
    }
  },
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确认清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('search_history');
          this.setData({ historyList: [] });
          wx.showToast({ title: '已清空历史', icon: 'none' });
        }
      }
    });
  },
  goToEdit(e) {
    const item = e.currentTarget.dataset.item;
    if (item && item.id) {
      wx.navigateTo({ url: `/pages/edit/edit?id=${item.id}` });
    }
  },
  onImageLoad(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      this.setData({ [`loadedImages.${id}`]: true });
    }
  }
});
