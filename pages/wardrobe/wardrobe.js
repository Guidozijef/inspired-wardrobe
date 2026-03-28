import { takePhoto, chooseImage } from '../utils'
import { WARDROBE_CATEGORIES } from '../constants'

const SEASON_EMOJI_MAP = {
  春季: '🌷',
  夏季: '☀️',
  秋季: '🍂',
  冬季: '❄️'
}

const OCCASION_EMOJI_MAP = {
  职场通勤: '💼',
  约会聚餐: '💕',
  周末休闲: '🏖',
  逛街拍照: '📷',
  旅行度假: '✈️',
  运动出汗: '🏃',
  聚会派对: '🎉',
  居家睡衣: '🛋',
  校园上课: '🎓'
}

function formatTagWithEmoji(value, emojiMap) {
  if (!value) return ''

  const normalizedValue = String(value).trim()
  const matchedKey = Object.keys(emojiMap).find((key) => (
    normalizedValue === key || normalizedValue.endsWith(` ${key}`)
  ))

  if (!matchedKey) {
    return normalizedValue
  }

  return `${emojiMap[matchedKey]} ${matchedKey}`
}

function formatSeasonIcon(value) {
  if (!value) return ''

  const normalizedValue = String(value).trim()
  const matchedKey = Object.keys(SEASON_EMOJI_MAP).find((key) => (
    normalizedValue === key || normalizedValue.endsWith(` ${key}`)
  ))

  if (!matchedKey) {
    return normalizedValue
  }

  return SEASON_EMOJI_MAP[matchedKey]
}

Page({
  data: {
    showAction: false,
    categories: WARDROBE_CATEGORIES,
    activeCategory: 0,
    items: [],
    statusBarHeight: 20,
    navBarHeight: 44,
    page: 0,
    pageSize: 10,
    isLoading: false,
    isNoMore: false
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    const menuButton = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: (menuButton.top - sysInfo.statusBarHeight) * 2 + menuButton.height
    })
  },

  onShow() {
    this.resetAndFetch()
  },

  resetAndFetch() {
    this.setData({
      page: 0,
      items: [],
      isNoMore: false,
      isLoading: false
    }, () => {
      this.fetchClothes()
    })
  },

  fetchClothes() {
    if (this.data.isLoading || this.data.isNoMore) return

    this.setData({ isLoading: true })
    wx.showLoading({ title: '加载中...', mask: true })

    const currentCategory = this.data.categories[this.data.activeCategory]

    wx.cloud.callFunction({
      name: 'clothFunctions',
      data: {
        type: 'getClothes',
        data: {
          category: currentCategory,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      }
    })
      .then((res) => {
        wx.hideLoading()
        this.setData({ isLoading: false })

        if (res.result && res.result.success) {
          const rawList = res.result.data || []
          const isNoMore = rawList.length < this.data.pageSize

          const newItems = rawList.map((item) => {
            const originalSeasons = Array.isArray(item.seasons) ? item.seasons : []
            const seasonIcons = originalSeasons
              .map((season) => formatSeasonIcon(season))
              .filter(Boolean)
            const firstOccasion = Array.isArray(item.occasions) && item.occasions.length
              ? formatTagWithEmoji(item.occasions[0], OCCASION_EMOJI_MAP)
              : ''

            return {
              id: item._id,
              category: item.category || '',
              emoji: item.image_url || '',
              title: item.name || '未命名单品',
              desc: item.category || '',
              seasons: seasonIcons,
              tag: firstOccasion
            }
          })

          this.setData({
            items: [...this.data.items, ...newItems],
            page: this.data.page + 1,
            isNoMore
          })
        }
      })
      .catch((err) => {
        this.setData({ isLoading: false })
        wx.hideLoading()
        console.error('获取 clothes 数据失败', err)
      })
  },

  onReachBottom() {
    this.fetchClothes()
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.activeCategory === index) return

    this.setData({ activeCategory: index }, () => {
      this.resetAndFetch()
    })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goToEdit(eOrPath) {
    let path = ''
    let id = ''

    if (typeof eOrPath === 'string') {
      path = eOrPath
    } else if (eOrPath && eOrPath.currentTarget) {
      const item = eOrPath.currentTarget.dataset.item || {}
      id = item.id || ''
    }

    let url = '/pages/edit/edit'
    const query = []
    if (path) query.push(`path=${encodeURIComponent(path)}`)
    if (id) query.push(`id=${id}`)
    if (query.length) {
      url += `?${query.join('&')}`
    }

    wx.navigateTo({ url })
  },

  showActionSheet() {
    this.setData({ showAction: true })
  },

  hideActionSheet() {
    this.setData({ showAction: false })
  },

  stopProp() {
    // Prevent event bubbling
  },

  async goPhotoalbum() {
    this.hideActionSheet()
    try {
      const filePath = await chooseImage()
      this.goToEdit(filePath)
    } catch (error) {
      console.error('从相册选择失败', error)
    }
  },

  async goPhotograph() {
    this.hideActionSheet()
    try {
      const filePath = await takePhoto()
      this.goToEdit(filePath)
    } catch (error) {
      console.error('拍照失败', error)
    }
  },

  switchTab(e) {
    const path = e.currentTarget.dataset.path
    wx.redirectTo({
      url: path
    })
  },

  onShareAppMessage() {
    return {
      title: '灵感衣橱 · 发现穿搭灵感，让美触手可及',
      path: '/pages/wardrobe/wardrobe'
    }
  },

  onShareTimeline() {
    return {
      title: '灵感衣橱 · 数字化你的衣橱，找回选衣服的乐趣'
    }
  }
})
