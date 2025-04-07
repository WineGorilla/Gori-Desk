window.addEventListener("DOMContentLoaded", async () => {
    try {
      const settings = await window.settingAPI.getSettings();
      const opacity = settings.transparency ?? 100;
      document.body.style.opacity = opacity / 100;
      console.log("初始透明度设置为:", opacity + "%");
    } catch (err) {
      console.error("读取设置失败:", err);
    }
  });

  // 同时监听透明度变化（来自设置页）
  window.settingAPI.onTransparencyChange((value) => {
    document.body.style.opacity = value / 100;
    console.log("透明度更新为:", value + "%");
  });