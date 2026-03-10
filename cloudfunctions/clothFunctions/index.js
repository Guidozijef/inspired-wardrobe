const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
// 获取openid
const getOpenId = async () => {
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 添加单品衣服
const addCloth = async (event, context) => {
  const { fileID, name, category, tags, color } = event
  const { OPENID } = cloud.getWXContext() // 获取当前用户ID

  try {
    // 1. (可选) 这里可以插入调用抠图 API 的逻辑，拿到处理后的图片
    // 为了简单，我们假设 fileID 已经是抠图后的图片

    // 2. 向 clothes 集合添加记录
    const res = await db.collection('clothes').add({
      data: {
        _openid: OPENID, // 云开发会自动处理，但写上更清晰
        name: name || '未命名衣物',
        image_url: fileID,
        category: category || '其他',
        tags: tags || [],
        color: color || '未知',
        wear_count: 0,
        is_favorite: false,
        create_time: db.serverDate(), // 使用服务器时间
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


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "addCloth":
      return await addCloth(event.data);
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