Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    look: {
      id: 1,
      title: '职场通勤',
      date: '2026-02-26',
      emoji: '🧥👖',
      bg: '#F3E8FF',
      items: ['🧥 基础白衬衫', '👖 直筒西装裤']
    }
  },
  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    });
    
    if (options.id) {
      this.fetchDetail(options.id);
    }
  },
  fetchDetail(id) {
    wx.showLoading({ title: '加载中...', mask: true });
    wx.cloud.callFunction({
      name: 'outfitFunctions',
      data: {
        type: 'getOutfitDetail',
        data: { id: id }
      }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        const data = res.result.data;
        this.setData({
          look: {
            id: data._id,
            title: data.title,
            date: this.formatDate(data.create_time),
            emoji: '🧥👖',
            bg: data.canvas_data ? data.canvas_data.background_color : '#F3E8FF',
            preview: data.preview_url,
            description: data.description,
            scene: data.scene,
            // 优先从关联查询结果中提取单品名称
            items: data.clothes_info ? data.clothes_info.map(c => c.name || c.category) : []
          }
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取搭配详情失败', err);
    });
  },
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },
  goBack() {
    wx.navigateBack();
  },
  shareImage() {
    if (this.data.look && this.data.look.id) {
      wx.navigateTo({ url: `/pages/share/share?id=${this.data.look.id}` });
    } else {
      wx.showToast({ title: '无法分享该穿搭', icon: 'none' });
    }
  },
  // 删除当前穿搭
  async deleteLook() {
    const id = this.data.look.id;
    if (!id) return;

    wx.showModal({
      title: '提示',
      content: '确定要删除这个穿搭方案吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '正在删除...', mask: true });
            const dbRes = await wx.cloud.callFunction({
              name: 'outfitFunctions',
              data: {
                type: 'deleteOutfit',
                data: { id: id }
              }
            });

            wx.hideLoading();

            if (dbRes.result.success) {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => {
                wx.navigateBack();
              }, 1000);
            } else {
              wx.showToast({ title: '删除失败：' + dbRes.result.errMsg, icon: 'none' });
            }
          } catch (err) {
            wx.hideLoading();
            console.error('删除穿搭失败:', err);
            wx.showToast({ title: '系统错误', icon: 'none' });
          }
        }
      }
    });
  },

  editLook() {
    if (this.data.look && this.data.look.id) {
      wx.redirectTo({ 
        url: `/pages/canvas/canvas?id=${this.data.look.id}&date=${this.data.look.date}` 
      });
    } else {
      wx.redirectTo({ url: '/pages/canvas/canvas' });
    }
  }
});
