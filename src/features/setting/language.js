const i18n = {
    zh: {
      greeting: "你好啊主人",
      ai: "AI助手",
      todo: "待办事项",
      note: "笔记",
      eat: "投喂",
      menu_info: "👤个人信息",
      menu_setting: "⚙️设置",
      menu_exit: "❌退出"
    },
    en: {
      greeting: "Hello, Master!",
      ai: "AI",
      todo: "To-Do",
      note: "Note",
      eat: "Feed",
      menu_info: "👤 Info",
      menu_setting: "⚙️ Settings",
      menu_exit: "❌ Quit"
    }
  };
  
  // 🌐 应用语言更新函数
  function updateLanguage(lang) {
    const t = i18n[lang] || i18n.zh;
  
    document.getElementById("speech-bubble").textContent = t.greeting;
    document.querySelector(".chat").title = t.ai;
    document.querySelector(".record").title = t.todo;
    document.querySelector(".note").title = t.note;
    document.querySelector(".eat").title = t.eat;
  
    document.getElementById("menu-info").textContent = t.menu_info;
    document.getElementById("menu-setting").textContent = t.menu_setting;
    document.getElementById("menu-exit").textContent = t.menu_exit;
  }
  
  // ✅ 页面初始化加载语言
  window.addEventListener("DOMContentLoaded", async () => {
    try {
      const settings = await window.settingAPI.getSettings();
      const lang = settings.language || "zh";
      updateLanguage(lang);
      console.log("🌍 初始语言已加载:", lang);
    } catch (err) {
      console.error("❌ 初始化语言失败:", err);
      updateLanguage("zh");
    }
  });
  
  // ✅ 主动监听来自设置页面的语言切换通知
  window.settingAPI.onLanguageChange((lang) => {
    updateLanguage(lang);
    console.log("🔁 主窗口语言已切换为:", lang);
  });
  

  