const cloud = require("wx-server-sdk");
const axios = require('axios');
const crypto = require('crypto');
const AK = "WrgzN4mbcOSv7m1UMsy0Nuym"
const SK = "zajIwznQyN5TlKsq16AVLmesajMhX7Jj"

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
// 获取openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  // 生成一个更友好的唯一 ID (IW-前缀 + OpenID 的哈希前 8 位)
  const displayId = 'IW-' + crypto.createHash('md5').update(openid).digest('hex').substring(0, 8).toUpperCase();
  
  return {
    displayId: displayId,
    openid: openid,
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
      return { code: 200, imageBase64: response.data.image } // 返回抠图后的 base64
    } else {
      return { code: response.data.error_code, message: response.data.error_msg}

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

// 辅助函数：更新用户的统计数量 (具备 Upsert 逻辑)
async function updateUserCount(openid, field, change) {
  const _ = db.command;
  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (userRes.data.length > 0) {
      // 如果用户已存在，执行增量更新
      await db.collection('users').doc(userRes.data[0]._id).update({
        data: {
          [field]: _.inc(change),
          update_time: db.serverDate()
        }
      });
    } else {
      // 如果用户不存在 (新用户第一次操作)，创建并初始化统计
      const userData = {
        _openid: openid,
        nickName: '新用户',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        clothesCount: 0,
        outfitCount: 0,
        create_time: db.serverDate(),
        update_time: db.serverDate()
      };
      // 只有在增加时才初始化为 change，减少时逻辑上不应进入此处但为安全设为 0
      userData[field] = Math.max(0, change);
      await db.collection('users').add({ data: userData });
    }
  } catch (err) {
    console.error('更新统计失败:', err);
  }
}


// 添加单品衣服
const addCloth = async (data) => {
  const { fileID, name, category, seasons, occasions, color } = data
  const { OPENID } = cloud.getWXContext()

  try {
    const res = await db.collection('clothes').add({
      data: {
        _openid: OPENID,
        name: name || '新入单品',
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

    // 同步更新统计
    await updateUserCount(OPENID, 'clothesCount', 1);

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
  const { OPENID } = cloud.getWXContext()
  
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

    // 只能更新属于自己的数据
    const res = await db.collection('clothes').where({
      _id: id,
      _openid: OPENID
    }).update({
      data: updateData
    })

    if (res.stats.updated === 0) {
      return {
        success: false,
        errMsg: '无权修改该数据或数据不存在'
      }
    }

    return {
      success: true,
      message: '信息已更新'
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    }
  }
}

// 获取衣物列表 (支持分类 & 分页)
const getClothes = async (data = {}) => {
  const { OPENID } = cloud.getWXContext();
  const { category } = data;
  const page = Number(data.page || 0);
  const pageSize = Number(data.pageSize || 10);

  try {
    let query = db.collection('clothes').where({
      _openid: OPENID
    });

    if (category && category !== '全部') {
      query = query.where({
        category: category
      });
    }

    const res = await query
      .orderBy('create_time', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: res.data
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    }
  }
}

// 获取单件衣物详情
const getClothDetail = async (id) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const res = await db.collection('clothes').doc(id).get()
    const cloth = res.data

    // 校验所有权
    if (cloth._openid !== OPENID) {
      return {
        success: false,
        errMsg: '无权访问该数据'
      }
    }

    return {
      success: true,
      data: cloth
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    }
  }
}

// 删除单品衣服
const deleteCloth = async (id) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 1. 先查出图片 fileID，用于后续从云存储删除
    const res = await db.collection('clothes').doc(id).get()
    const cloth = res.data
    
    // 校验所有权
    if (cloth._openid !== OPENID) {
      return {
        success: false,
        errMsg: '无权删除该数据'
      }
    }

    const { image_url } = cloth

    // 2. 从数据库删除记录
    await db.collection('clothes').doc(id).remove()

    // 3. 从云存储删除图片文件
    if (image_url) {
      await cloud.deleteFile({
        fileList: [image_url],
      })
    }

    // 同步更新统计
    await updateUserCount(OPENID, 'clothesCount', -1);

    return {
      success: true,
      message: '衣服已从衣橱移除'
    }
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    }
  }
}


// 获取用户信息
const getUserProfile = async () => {
  const { OPENID } = cloud.getWXContext();
  try {
    const res = await db.collection('users').where({ _openid: OPENID }).get();
    if (res.data.length > 0) {
      const user = res.data[0];
      
      // 自动同步缺失的统计数据 (迁移逻辑)
      if (user.clothesCount === undefined || user.outfitCount === undefined) {
        const clothesRes = await db.collection('clothes').where({ _openid: OPENID }).count();
        const outfitsRes = await db.collection('outfits').where({ _openid: OPENID }).count();
        
        const updateData = {
          clothesCount: clothesRes.total,
          outfitCount: outfitsRes.total,
          update_time: db.serverDate()
        };
        
        await db.collection('users').doc(user._id).update({
          data: updateData
        });
        
        return { success: true, data: { ...user, ...updateData } };
      }
      
      return { success: true, data: user };
    }
    return { success: true, data: null };
  } catch (err) {
    return { success: false, errMsg: err.message || err };
  }
}

// 更新用户信息
const updateUserProfile = async (data) => {
  const { OPENID } = cloud.getWXContext();
  const { nickName, avatarUrl } = data;
  try {
    const res = await db.collection('users').where({ _openid: OPENID }).get();
    if (res.data.length > 0) {
      // 更新
      await db.collection('users').doc(res.data[0]._id).update({
        data: {
          nickName: nickName || res.data[0].nickName,
          avatarUrl: avatarUrl || res.data[0].avatarUrl,
          update_time: db.serverDate()
        }
      });
    } else {
      // 新增
      await db.collection('users').add({
        data: {
          _openid: OPENID,
          nickName: nickName || 'The Curator',
          avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          clothesCount: 0,
          outfitCount: 0,
          create_time: db.serverDate(),
          update_time: db.serverDate()
        }
      });
    }
    return { success: true, message: '个人信息已更新' };
  } catch (err) {
    return { success: false, errMsg: err.message || err };
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
    case "getClothes":
      return await getClothes(event.data);
    case "getClothDetail":
      return await getClothDetail(event.data.id);
    case "deleteCloth":
      return await deleteCloth(event.data.id);
    case "getRandomItems":
      try {
        const { OPENID } = cloud.getWXContext();
        // 随机获取一些单品用于推荐
        const res = await db.collection('clothes')
          .aggregate()
          .match({ _openid: OPENID })
          .limit(1000) // 限制1000件通常已覆盖个人衣橱
          .end();
        return { success: true, data: res.list };
      } catch (err) {
        return { success: false, errMsg: err.message || err };
      }
    case "doCutout":
      try {
        const {code, imageBase64, message } = await aiCutout(event.data.fileID)
        if (code !== 200) {
          return { success: false, errMsg: message }
        }
        const newFileID = await saveProcessedImage(imageBase64)
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
    case "getOpenId":
      return await getOpenId();
    case "getUserProfile":
      return await getUserProfile();
    case "updateUserProfile":
      return await updateUserProfile(event.data);
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