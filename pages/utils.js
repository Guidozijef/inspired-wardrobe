
// 拍照上传
export function uploadPhoto() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1, // 仅拍摄一张
      mediaType: ["image"],
      sourceType: ["camera"], // 仅调用相机
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 压缩图片
        const df = wx.compressImage({
          src: tempFilePath, // 图片路径
          quality: 50 // 压缩质量
        })
        df.then(res => {
          resolve(res.tempFilePath)
        })
      },
    });
  })
} 