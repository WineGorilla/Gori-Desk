const i18n = {
    zh: {
      quoteTitle: "上传自定义语录JSON",
      quoteUpload: "上传",
      quoteReset: "默认",
      quoteUploadSuccess: "上传成功",
      quoteUploadFail: "上传失败",
      quoteResetConfirm: "你确定恢复默认吗？这将删除当前自定义语录",
      quoteResetSuccess: "已恢复",
      quoteResetFail: "恢复失败",
      quoteSourceCustom: "自定义",
      quoteSourceDefault: "默认",
      quoteSourceUnknown: "未知",
      quoteCurrent: "当前使用语录："
    },
    en: {
      quoteTitle: "Upload Custom Quote JSON",
      quoteUpload: "Upload",
      quoteReset: "Reset",
      quoteUploadSuccess: "Upload success",
      quoteUploadFail: "Upload failed",
      quoteResetConfirm: "Are you sure to reset? This will delete your custom quote.",
      quoteResetSuccess: "Reset done",
      quoteResetFail: "Reset failed",
      quoteSourceCustom: "Custom",
      quoteSourceDefault: "Default",
      quoteSourceUnknown: "Unknown",
      quoteCurrent: "Current Quote Source:"
    }
  };
  
  let t = i18n.zh; // 默认中文
  
  window.addEventListener("DOMContentLoaded", async () => {
    const settings = await window.settingAPI.getSettings?.();
    const lang = settings?.language || "zh";
    t = i18n[lang] || i18n.zh;
  
    updateQuoteLanguage();    // 设置按钮和标题
    updateQuoteStatus();      // 设置状态值
  });
  
  // 上传语录按钮
  document.getElementById("uploadQuoteJson").addEventListener("click", async () => {
    const result = await window.talkAPI.uploadQuotes();
    const status = document.getElementById("uploadStatus");
  
    if (result.success) {
      status.textContent = t.quoteUploadSuccess;
      status.style.color = "orange";
    } else {
      status.textContent = t.quoteUploadFail;
      status.style.color = "red";
    }
  });
  
  // 重置语录按钮
  document.getElementById("resetQuoteJson").addEventListener("click", async () => {
    const confirmReset = confirm(t.quoteResetConfirm);
    if (!confirmReset) return;
  
    const result = await window.talkAPI.resetQuotes();
    const status = document.getElementById("uploadStatus");
  
    if (result.success) {
      status.textContent = t.quoteResetSuccess;
      status.style.color = "green";
    } else {
      status.textContent = t.quoteResetFail;
      status.style.color = "red";
    }
  });
  
  // 当前语录状态
  async function updateQuoteStatus() {
    const source = await window.talkAPI.getQuoteSource();
    const statusEl = document.getElementById("currentQuoteSource");
  
    if (source === "自定义" || source === "custom") {
      statusEl.textContent = t.quoteSourceCustom;
      statusEl.style.color = "orange";
    } else if (source === "默认" || source === "default") {
      statusEl.textContent = t.quoteSourceDefault;
      statusEl.style.color = "#28a745";
    } else {
      statusEl.textContent = t.quoteSourceUnknown;
      statusEl.style.color = "red";
    }
  }
  
  // 国际化 UI 更新函数
  function updateQuoteLanguage() {
    document.getElementById("quoteTitle").textContent = t.quoteTitle;
    document.getElementById("uploadQuoteJson").textContent = t.quoteUpload;
    document.getElementById("resetQuoteJson").textContent = t.quoteReset;
  }
  


