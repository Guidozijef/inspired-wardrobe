
// 通用图片压缩逻辑
function compressImage(path) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: path,
      quality: 30,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err)
    });
  });
}

// 拍照上传
export function takePhoto() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["camera"],
      success: async (res) => {
        try {
          const compressed = await compressImage(res.tempFiles[0].tempFilePath);
          resolve(compressed);
        } catch (e) {
          reject(e);
        }
      },
      fail: reject
    });
  });
}

// 从相册选择
export function chooseImage() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album"],
      success: async (res) => {
        try {
          const compressed = await compressImage(res.tempFiles[0].tempFilePath);
          resolve(compressed);
        } catch (e) {
          reject(e);
        }
      },
      fail: reject
    });
  });
}