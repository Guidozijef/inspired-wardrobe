// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个云环境的资源
      // 此处请填入环境 ID, 环境 ID 可在微信开发者工具右上顶部工具栏点击云开发按钮打开获取
      env: "rest-api-6gm73bqx23252469",
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
      // 临时工具：自动上传背景图到云存储，并生成配置文件
      // this.uploadLocalAssets();
    }
  },

  // 临时辅助函数：将本地素材上传到云端
  async uploadLocalAssets() {
    const assets = [
      'bg_plaster_shadow.png', 'bg_terrazzo.png', 'bg_light_wood.png',
      'bg_new_year_floral.png', 'bg_cute_botanical.png', 'bg_vintage_frame.png',
      'bg_christmas.png', 'bg_autumn.png', 'bg_memphis.png',
      'bg_spring_cherry.png', 'bg_scrapbook_tape.png', 'bg_summer_beach.png',
      'bg_neon_cyberpunk.png', 'bg_clouds_stars.png', 'bg_gold_foliage.png',
      'bg_beige_silk.png', 'bg_aura_grain.png'
    ];

    console.log("【云端迁移】开始上传背景图...");
    let results = [];

    for (let file of assets) {
      try {
        const res = await wx.cloud.uploadFile({
          cloudPath: 'backgrounds/' + file,
          filePath: '/assets/backgrounds/' + file,
        });
        results.push({ file, fileID: res.fileID });
        console.log('✅ 成功上传:', file);
      } catch (err) {
        console.error('❌ 上传失败:', file, err);
      }
    }

    console.log("【云端迁移】全部上传完毕！请将以下 File ID 替换到 canvas.js 的 value 和 css 中：");
    console.log(JSON.stringify(results, null, 2));
    console.log("【云端迁移】完成后，请注释或删除 app.js 中的 this.uploadLocalAssets(); 以及删除本地 assets/backgrounds 文件夹。");
  },
});
