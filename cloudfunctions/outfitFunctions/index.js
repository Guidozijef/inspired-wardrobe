const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

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

// 添加/更新搭配
const addOutfit = async (data) => {
  const { OPENID } = cloud.getWXContext();
  const { 
    id, 
    canvas_data, 
    clothes_ids, 
    description, 
    scene, 
    title,
    preview_url,
    recordDate
  } = data;

  const outfitData = {
    _openid: OPENID,
    canvas_data,
    clothes_ids,
    create_time: db.serverDate(),
    record_date: recordDate || '',
    description: description || '',
    last_worn_date: '',
    preview_url: preview_url || '',
    scene: scene || '日常',
    title: title || '我的搭配',
    update_time: db.serverDate()
  };

  try {
    let resultId = id;
    if (id) {
      const updateRes = await db.collection('outfits').where({
        _id: id,
        _openid: OPENID
      }).update({
        data: outfitData
      });
      
      if (updateRes.stats.updated === 0) {
        throw new Error('无权修改该搭配或搭配不存在');
      }
    } else {
      const res = await db.collection('outfits').add({
        data: outfitData
      });
      resultId = res._id;

      // 同步更新统计
      await updateUserCount(OPENID, 'outfitCount', 1);
    }

    return {
      success: true,
      id: resultId,
      message: '保存成功！'
    };
  } catch (err) {
    return { success: false, errMsg: err.message || err };
  }
};

// 获取搭配列表 (支持月份过滤 & 分页)
const getOutfits = async (data = {}) => {
  const { OPENID } = cloud.getWXContext();
  const page = Number(data.page || 0);
  const pageSize = Number(data.pageSize || 10);
  const { monthStr } = data; 

  try {
    let condition = { _openid: OPENID };

    if (monthStr) {
      condition.record_date = db.RegExp({
        regexp: '^' + monthStr,
        options: 'i'
      });
    }

    const res = await db.collection('outfits')
      .where(condition)
      .orderBy('create_time', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get();

    // 数据标准化
    const standardizedData = res.data.map(item => {
      let record_date = item.record_date || '';
      let create_time_iso = '';

      if (item.create_time) {
        const d = (item.create_time instanceof Date) ? item.create_time : new Date(item.create_time);
        if (!isNaN(d.getTime())) {
          create_time_iso = d.toISOString();
          if (!record_date) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            record_date = `${year}-${month}-${day}`;
          }
        }
      }

      return {
        ...item,
        create_time: create_time_iso,
        record_date: record_date
      };
    });

    return {
      success: true,
      data: standardizedData
    };
  } catch (err) {
    return { success: false, errMsg: err.message || err };
  }
};

// 获取单个搭配详情
const getOutfitDetail = async (id) => {
  const { OPENID } = cloud.getWXContext();
  try {
    const res = await db.collection('outfits').doc(id).get();
    const outfit = res.data;
    
    if (outfit._openid !== OPENID) {
      return { success: false, errMsg: '无权访问该数据' };
    }

    if (outfit.clothes_ids && outfit.clothes_ids.length > 0) {
      const _ = db.command;
      const clothesRes = await db.collection('clothes')
        .where({
          _id: _.in(outfit.clothes_ids),
          _openid: OPENID
        })
        .get();
      outfit.clothes_info = clothesRes.data;
    } else {
      outfit.clothes_info = [];
    }

    return { success: true, data: outfit };
  } catch (err) {
    return { success: false, errMsg: err.message || err };
  }
};

// 删除搭配
const deleteOutfit = async (id) => {
  const { OPENID } = cloud.getWXContext();
  if (typeof id === 'object') id = id.id;

  try {
    const res = await db.collection('outfits').doc(id).get();
    const outfit = res.data;

    if (outfit._openid !== OPENID) {
      return { success: false, errMsg: '无权删除该数据' };
    }

    const { preview_url } = outfit;
    await db.collection('outfits').doc(id).remove();
    if (preview_url) {
      await cloud.deleteFile({ fileList: [preview_url] });
    }

    // 同步更新统计
    await updateUserCount(OPENID, 'outfitCount', -1);

    return { success: true, message: '搭配已删除' };
  } catch (err) {
    return { success: false, errMsg: err.message || err };
  }
};

exports.main = async (event, context) => {
  switch (event.type) {
    case "addOutfit":
      return await addOutfit(event.data);
    case "getOutfits":
      return await getOutfits(event.data);
    case "getOutfitDetail":
      return await getOutfitDetail(event.data.id);
    case 'deleteOutfit':
      return await deleteOutfit(event.data);
    default:
      return { success: false, errMsg: '未知的请求类型' };
  }
};
