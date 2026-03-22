// 通用图片压缩逻辑
export function compressImage(path) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: path,
      success: (info) => {
        const { width, height } = info;
        const maxSize = 1200;
        let targetWidth = width;
        let targetHeight = height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            targetWidth = maxSize;
            targetHeight = Math.round((height / width) * maxSize);
          } else {
            targetHeight = maxSize;
            targetWidth = Math.round((width / height) * maxSize);
          }
        }

        wx.compressImage({
          src: path,
          quality: 80, // 质量设为 80 较平衡
          compressedWidth: targetWidth,
          compressedHeight: targetHeight,
          success: (res) => {
            const compressedPath = res.tempFilePath;
            // 检测压缩后的大小
            const fs = wx.getFileSystemManager();
            fs.getFileInfo({
              filePath: compressedPath,
              success: (fileInfo) => {
                const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
                if (fileInfo.size > 1024 * 1024) {
                  wx.showModal({
                    title: '图片体积过大',
                    content: `压缩后文件大小为 ${sizeMB}MB，超过了 1MB 的限制，请更换图片或自行缩小后再上传。`,
                    showCancel: false,
                    confirmText: '我知道了',
                    success: () => {
                      reject(new Error('图片体积超过 1MB 限制'));
                    }
                  });
                } else {
                  resolve(compressedPath);
                }
              },
              fail: () => resolve(compressedPath) // 获取信息失败则直接返回
            });
          },
          fail: (err) => {
            console.error('压缩失败，返回原图', err);
            resolve(path); // 失败落退回原图
          }
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败', err);
        resolve(path);
      }
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