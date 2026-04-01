import { compressImage } from '../utils'

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    heroTopPadding: 64,
    openid: '',
    nickName: 'The Curator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    showEditModal: false,
    tempAvatarUrl: '',
    tempNickName: '',
    isUpdatingProfile: false,
    outfitCount: 0,
    clothesCount: 0,
    usedCutouts: 0,
    totalCutouts: 10,
    latestDate: '无'
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    let menuButton = null;
    try {
      menuButton = wx.getMenuButtonBoundingClientRect();
    } catch (e) {}
    
    const navBarHeight = menuButton ? (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height : 44;
    const heroTopPadding = menuButton ? Math.ceil(menuButton.bottom + 16) : sysInfo.statusBarHeight + navBarHeight + 16;
    
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: navBarHeight,
      heroTopPadding: heroTopPadding
    }, () => {
      this.fetchUserOpenId();   // 获取用户ID
      this.fetchUserProfile();  // 获取用户信息 (包含统计)
    });
  },

  // 获取用户个人信息 (从 users 集合，包含 clothesCount 和 outfitCount)
  fetchUserProfile() {
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: { type: 'getUserProfile' }
    }).then(res => {
      if (res.result && res.result.success && res.result.data) {
        const { nickName, avatarUrl, clothesCount, outfitCount, todayCutoutCount, lastCutoutDate } = res.result.data;
        
        // 计算 AI 抠图已用次数
        const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
        let usedCutouts = 0;
        if (lastCutoutDate === today) {
          usedCutouts = todayCutoutCount || 0;
        }

        this.setData({
          nickName: nickName || this.data.nickName,
          avatarUrl: avatarUrl || this.data.avatarUrl,
          clothesCount: Math.max(0, clothesCount !== undefined ? clothesCount : 0),
          outfitCount: Math.max(0, outfitCount !== undefined ? outfitCount : 0),
          usedCutouts
        });
      }
    }).catch(err => {
      console.error('获取用户信息失败:', err);
    });
  },

  // 获取用户唯一标识
  fetchUserOpenId() {
    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: { type: 'getOpenId' }
    }).then(res => {
      if (res.result && res.result.displayId) {
        this.setData({
          openid: res.result.displayId
        });
      }
    }).catch(err => {
      console.error('获取 OpenID 失败:', err);
    });
  },

  // 编辑个人信息入口
  editProfile() {
    this.setData({
      showEditModal: true,
      tempAvatarUrl: this.data.avatarUrl,
      tempNickName: this.data.nickName
    });
  },

  hideEditModal() {
    this.setData({ showEditModal: false });
  },

  copyUserId() {
    if (!this.data.openid) return;

    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({
          title: 'ID 已复制',
          icon: 'success'
        });
      }
    });
  },

  // 微信头像选择机制
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    wx.showLoading({ title: '正在处理头像...', mask: true });
    try {
      const compressed = await compressImage(avatarUrl);
      this.setData({ tempAvatarUrl: compressed });
    } catch (err) {
      console.error('压缩头像失败', err);
      this.setData({ tempAvatarUrl: avatarUrl });
    } finally {
      wx.hideLoading();
    }
  },

  // 微信昵称输入机制
  onNicknameBlur(e) {
    const nickName = e.detail.value;
    this.setData({ tempNickName: nickName });
  },

  onNicknameInput(e) {
    const nickName = e.detail.value;
    this.setData({ tempNickName: nickName });
  },

  // 保存个人信息
  async saveProfile() {
    const { tempNickName, tempAvatarUrl, avatarUrl, nickName } = this.data;
    
    if (!tempNickName && !tempAvatarUrl) {
      this.hideEditModal();
      return;
    }

    this.setData({ isUpdatingProfile: true });
    wx.showLoading({ title: '保存中...', mask: true });

    try {
      let finalAvatarUrl = tempAvatarUrl || avatarUrl;

      // 如果头像发生了变化且是临时文件，则上传到云端
      if (tempAvatarUrl && tempAvatarUrl !== avatarUrl && !tempAvatarUrl.startsWith('cloud://')) {
        const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempAvatarUrl
        });
        finalAvatarUrl = uploadRes.fileID;
      }

      const updateData = {
        nickName: tempNickName || nickName,
        avatarUrl: finalAvatarUrl
      };

      const res = await wx.cloud.callFunction({
        name: 'clothFunctions',
        data: {
          type: 'updateUserProfile',
          data: updateData
        }
      });

      wx.hideLoading();
      if (res.result && res.result.success) {
        this.setData({
          ...updateData,
          showEditModal: false,
          isUpdatingProfile: false
        });
        wx.showToast({ title: '已同步个人信息', icon: 'success' });
      } else {
        throw new Error(res.result.errMsg || '更新失败');
      }
    } catch (err) {
      console.error('保存失败:', err);
      wx.hideLoading();
      this.setData({ isUpdatingProfile: false });
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  switchTab(e) {
    const path = e.currentTarget.dataset.path;
    wx.redirectTo({ url: path });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },
});
