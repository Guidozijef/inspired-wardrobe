const cloud = require("wx-server-sdk");
const axios = require('axios');
const AK = "WrgzN4mbcOSv7m1UMsy0Nuym"
const SK = "zajIwznQyN5TlKsq16AVLmesajMhX7Jj"

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
// 获取openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 */
async function getAccessToken() {
  const options = {
    'method': 'POST',
    'url': `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`,
  }
  try {
    const res = await axios(options)
    return res.data.access_token
  } catch (err) {
    console.error('获取 AccessToken 失败:', err)
    throw err
  }
}

/**
 * 抠图 API 调用
 * @param {string} fileID 云存储 ID
 */
async function aiCutout(fileID) {
  // 1. 下载图片并转为 base64
  const downloadRes = await cloud.downloadFile({
    fileID: fileID,
  })
  const base64Image = downloadRes.fileContent.toString('base64')
  const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  // 2. 调用百度 API
  const token = await getAccessToken()
  const options = {
    method: 'POST',
    url: 'https://aip.baidubce.com/rest/2.0/image-process/v1/segment?access_token=' + token,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: {
      "image": pureBase64,
      "refine_mask": "true",
      "method": "auto"
    }
  };

  try {
    const response = await axios(options)
    if (response.data && response.data.image) {
      return response.data.image // 返回抠图后的 base64
    } else {
      throw new Error(JSON.stringify(response.data))
    }
  } catch (error) {
    console.error('百度 API 调用失败:', error)
    throw error
  }
}

/**
 * 保存处理后的 base64 图片到云存储
 */
async function saveProcessedImage(base64Data) {
  const buffer = Buffer.from(base64Data, 'base64')
  const fileName = `cutout/${Date.now()}-${Math.floor(Math.random() * 1000)}.png`
  
  const uploadRes = await cloud.uploadFile({
    cloudPath: fileName,
    fileContent: buffer,
  })
  return uploadRes.fileID
}


// 添加单品衣服
const addCloth = async (data) => {
  const { fileID, name, category, seasons, occasions, color } = data
  const { OPENID } = cloud.getWXContext()

  try {
    const res = await db.collection('clothes').add({
      data: {
        _openid: OPENID,
        name: name || '未命名衣物',
        image_url: fileID,
        category: category || '其他',
        seasons: seasons || [],
        occasions: occasions || [],
        color: color || '未知',
        wear_count: 0,
        is_favorite: false,
        create_time: db.serverDate(),
        update_time: db.serverDate()
      }
    })

    return {
      success: true,
      id: res._id,
      message: '衣服已成功挂进衣橱！'
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err
    }
  }
}

// 更新单品衣服
const updateCloth = async (data) => {
  const { id, name, category, seasons, occasions, color, fileID } = data
  
  try {
    const updateData = {
      name,
      category,
      seasons,
      occasions,
      color,
      update_time: db.serverDate()
    }
    
    // 如果有新的图片 fileID，则更新
    if (fileID) {
      updateData.image_url = fileID
    }

    await db.collection('clothes').doc(id).update({
      data: updateData
    })

    return {
      success: true,
      message: '信息已更新'
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err
    }
  }
}


// 云函数入口函数
exports.main = async (event, context) => {
  console.log('脚本加载成功')
  switch (event.type) {
    case "addCloth":
      return await addCloth(event.data);
    case "updateCloth":
      return await updateCloth(event.data);
    case "doCutout":
      try {
        const foregroundBase64 = await aiCutout(event.data.fileID)
        const newFileID = await saveProcessedImage(foregroundBase64)
        return {
          success: true,
          fileID: newFileID
        }
      } catch (err) {
        return {
          success: false,
          errMsg: err.message || err
        }
      }
    default:
      return {
        success: false,
        errMsg: 'Unknown type'
      }
  }
};



// 使用案例
// await wx.cloud.callFunction({
//   name: "quickstartFunctions",
//   data: {
//     type: "insertRecord",
//     data: {
//       region: insertRegion,
//       city: insertCity,
//       sales: Number(insertSales),
//     },
//   },
// });



// // 新增数据
// const insertRecord = async (event) => {
//   try {
//     const insertRecord = event.data;
//     // 插入数据
//     await db.collection("sales").add({
//       data: {
//         region: insertRecord.region,
//         city: insertRecord.city,
//         sales: Number(insertRecord.sales),
//       },
//     });
//     return {
//       success: true,
//       data: event.data,
//     };
//   } catch (e) {
//     return {
//       success: false,
//       errMsg: e,
//     };
//   }
// };

// exports.main = async (event, context) => {
//   switch (event.type) {
//     case "insertRecord":
//       return await insertRecord(event);
//   }
// };