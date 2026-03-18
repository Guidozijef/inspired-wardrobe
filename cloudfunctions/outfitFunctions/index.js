const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 添加搭配
const addOutfit = async (data) => {
  const { OPENID } = cloud.getWXContext();
  const { 
    canvas_data, 
    clothes_ids, 
    description, 
    scene, 
    title,
    preview_url
  } = data;

  try {
    const res = await db.collection('outfits').add({
      data: {
        _openid: OPENID,
        canvas_data,
        clothes_ids,
        create_time: db.serverDate(),
        description: description || '',
        last_worn_date: '',
        preview_url: preview_url || '',
        scene: scene || '日常',
        title: title || '我的搭配'
      }
    });

    return {
      success: true,
      id: res._id,
      message: '搭配保存成功！'
    };
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    };
  }
};

// 获取搭配列表
const getOutfits = async () => {
  const { OPENID } = cloud.getWXContext();

  try {
    const res = await db.collection('outfits')
      .where({
        _openid: OPENID
      })
      .orderBy('create_time', 'desc')
      .get();

    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    };
  }
};

// 获取单个搭配详情（包含关联单品信息）
const getOutfitDetail = async (id) => {
  const { OPENID } = cloud.getWXContext();
  try {
    const res = await db.collection('outfits').doc(id).get();
    const outfit = res.data;
    
    // 校验所有权
    if (outfit._openid !== OPENID) {
      return {
        success: false,
        errMsg: '无权访问该数据'
      };
    }

    // 如果有 clothes_ids，则联表查询单品详情
    if (outfit.clothes_ids && outfit.clothes_ids.length > 0) {
      const _ = db.command;
      const clothesRes = await db.collection('clothes')
        .where({
          _id: _.in(outfit.clothes_ids),
          _openid: OPENID // 额外验证关联单品的所有权
        })
        .get();
      outfit.clothes_info = clothesRes.data;
    } else {
      outfit.clothes_info = [];
    }

    return {
      success: true,
      data: outfit
    };
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    };
  }
};

// 删除搭配
const deleteOutfit = async (id) => {
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 先查出预览图 fileID
    const res = await db.collection('outfits').doc(id).get();
    const outfit = res.data;

    // 校验所有权
    if (outfit._openid !== OPENID) {
      return {
        success: false,
        errMsg: '无权删除该数据'
      };
    }

    const { preview_url } = outfit;

    // 2. 从数据库删除记录
    await db.collection('outfits').doc(id).remove();

    // 3. 从云存储删除预览图
    if (preview_url) {
      await cloud.deleteFile({
        fileList: [preview_url],
      });
    }

    return {
      success: true,
      message: '搭配已删除'
    };
  } catch (err) {
    return {
      success: false,
      errMsg: err.message || err
    };
  }
};

exports.main = async (event, context) => {
  switch (event.type) {
    case "addOutfit":
      return await addOutfit(event.data);
    case "getOutfits":
      return await getOutfits();
    case "getOutfitDetail":
      return await getOutfitDetail(event.data.id);
    case "deleteOutfit":
      return await deleteOutfit(event.data.id);
    default:
      return {
        success: false,
        errMsg: 'Unknown type'
      };
  }
};
