const i18n = {
    zh: {
      navInfo: "资料",
      navSetting: "基础设置",
      navCustom: "自定义",
  
      titleLLM: "大语言模型自定义",
      modelSetting: "模型设置",
      downloadModel: "模型下载",
      downloadBtn: "下载",
      switchBtn: "切换模型",
      deleteBtn: "删除模型",
      modelPlaceholder: "例如：gemma:2b",
      statusSwitchSuccess: (model) => `当前模型已切换为 ${model}`,
      statusDownloadSuccess: (model) => `下载完成并切换为 ${model}`,
      statusDownloadFail: "下载失败",
  
      personalityTitle: "性格设定",
      savePersonality: "保存",
      personalitySaved: "已保存",
  
      quoteTitle: "上传自定义语录JSON",
      quoteCurrent: "当前使用语录：",
      quoteUpload: "上传",
      quoteReset: "默认",
      quoteUploadSuccess: "上传成功",
      quoteUploadFail: "上传失败",
      quoteResetSuccess: "已恢复",
      quoteResetFail: "恢复失败",
      quoteResetConfirm: "你确定恢复默认吗？这将删除当前自定义语录",
  
      avatarTitle: "自定义形象 GIF / PNG",
      upload: "上传",
      reset: "默认",
      statusLoaded: "已加载上传图",
      statusDefault: "使用默认",
      statusCancel: "已取消选择",
  
      statusCustom: "自定义",
      statusDefaultText: "默认",
      statusUnknown: "未知",
  
      modelEmpty: "模型名不能为空"
    },
    en: {
      navInfo: "Info",
      navSetting: "Settings",
      navCustom: "Customize",
  
      titleLLM: "LLM Customization",
      modelSetting: "Model Settings",
      downloadModel: "Model Download",
      downloadBtn: "Download",
      switchBtn: "Switch Model",
      deleteBtn: "Delete Model",
      modelPlaceholder: "e.g., gemma:2b",
      statusSwitchSuccess: (model) => `Model switched to ${model}`,
      statusDownloadSuccess: (model) => `Downloaded and switched to ${model}`,
      statusDownloadFail: "Download failed",
  
      personalityTitle: "Personality Prompt",
      savePersonality: "Save",
      personalitySaved: "Saved",
  
      quoteTitle: "Upload Custom Quote JSON",
      quoteCurrent: "Current Quote Source:",
      quoteUpload: "Upload",
      quoteReset: "Reset",
      quoteUploadSuccess: "Upload success",
      quoteUploadFail: "Upload failed",
      quoteResetSuccess: "Reset done",
      quoteResetFail: "Reset failed",
      quoteResetConfirm: "Are you sure to reset to default? It will delete your custom quote file.",
  
      avatarTitle: "Custom GIF / PNG Avatars",
      upload: "Upload",
      reset: "Reset",
      statusLoaded: "Custom image loaded",
      statusDefault: "Using default",
      statusCancel: "Selection cancelled",
  
      statusCustom: "Custom",
      statusDefaultText: "Default",
      statusUnknown: "Unknown",
  
      modelEmpty: "Model name cannot be empty"
    }
  };

  function updateLanguage(lang) {
    const t = i18n[lang] || i18n.zh;
  
    // 左侧导航
    document.getElementById("infoBtn").textContent = t.navInfo;
    document.getElementById("settingsBtn").textContent = t.navSetting;
    document.getElementById("customBtn").textContent = t.navCustom;
  
    // 模型设置区标题
    document.querySelector("h2").textContent = t.titleLLM;
    document.querySelector("h4").textContent = t.modelSetting;
    document.querySelectorAll("h4")[1].textContent = t.downloadModel;
    document.getElementById("customModel").placeholder = t.modelPlaceholder;
    document.getElementById("setModelBtn").textContent = t.switchBtn;
    document.getElementById("savePersonalityBtn").textContent = t.savePersonality;
    document.querySelectorAll("h4")[2].textContent = t.personalityTitle;
    document.getElementById("downloadBtn").textContent = t.downloadBtn;
  
    // quote区域
    document.querySelectorAll("h2")[1].textContent = t.quoteTitle;
    document.getElementById("uploadQuoteJson").textContent = t.quoteUpload;
    document.getElementById("resetQuoteJson").textContent = t.quoteReset;
    document.getElementById("currentQuoteSource").previousSibling.textContent = t.quoteCurrent;
  
    // gif上传标题
    document.querySelectorAll("h2")[2].textContent = t.avatarTitle;
  
    // 上传区按钮、状态文字动态替换可参考 actions.forEach 内的逻辑，用 `t.upload` `t.reset` `t.statusLoaded` 等替换
  }

  window.settingAPI.onLanguageChange((lang)=>{
    updateLanguage(lang)
  })

  window.addEventListener("DOMContentLoaded", async () => {
    const settings = await window.settingAPI.getSettings?.();
    updateLanguage(settings.language || "zh");
  });
  
  
