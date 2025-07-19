const i18n = {
    zh: {
      gifActions: {
        idle: "默认",
        struggle: "挣扎",
        eatA: "食物A",
        eatB: "食物B",
        eatC: "食物C",
        hungry: "饿",
        comfort: "安慰"
      },
      upload: "上传",
      reset: "默认",
      uploadSuccess: "上传成功！",
      uploadCancel: "已取消选择",
      uploadError: "出错",
      quoteUploadSuccess: "上传成功",
      quoteUploadFail: "上传失败",
      quoteResetConfirm: "你确定恢复默认吗？这将删除当前自定义语录",
      quoteResetSuccess: "已恢复",
      quoteResetFail: "恢复失败",
      quoteSourceCustom: "自定义",
      quoteSourceDefault: "默认",
      quoteSourceUnknown: "未知",
      loadFail: "加载失败"
    },
    en: {
      gifActions: {
        idle: "Idle",
        struggle: "Struggle",
        eatA: "Food A",
        eatB: "Food B",
        eatC: "Food C",
        hungry: "Hungry",
        comfort: "Comfort"
      },
      upload: "Upload",
      reset: "Reset",
      uploadSuccess: "Upload success!",
      uploadCancel: "Selection cancelled",
      uploadError: "Error",
      quoteUploadSuccess: "Upload success",
      quoteUploadFail: "Upload failed",
      quoteResetConfirm: "Are you sure to reset? This will delete your custom quote.",
      quoteResetSuccess: "Reset done",
      quoteResetFail: "Reset failed",
      quoteSourceCustom: "Custom",
      quoteSourceDefault: "Default",
      quoteSourceUnknown: "Unknown",
      loadFail: "Load failed"
    }
  };
  
  
      const actions = ["idle", "struggle", "eatA", "eatB", "eatC", "hungry", "comfort"];
  
  
      const uploadArea = document.getElementById("uploadArea");
  
  
  
      async function selectAndUpload(action) {
        const filePath = await window.gifAPI.selectGifFile();
        const status = document.getElementById("status-" + action);
        const preview = document.getElementById("preview-" + action);
  
        if (!filePath) {
          preview.src = "";
          return;
        }
  
        try {
          const res = await fetch("file://" + filePath);
          const blob = await res.blob();
  
          const reader = new FileReader();
          reader.onload = () => {
            preview.src = reader.result;
          };
          reader.readAsDataURL(blob);
  
          await window.gifAPI.uploadGIF(action, filePath);
        } catch (err) {
          console.error(err);
        }
      }
  

  async function initPreview() {
    for (const action of actions) {
      try {
        const imgPath = await window.gifAPI.getCurrentImage(action);
        const img = document.getElementById("preview-" + action);
        const status = document.getElementById("status-" + action);
  
        if (imgPath && img) {
          img.src = imgPath;
        } else {
        }
      } catch (err) {
        console.error("加载失败：", err);
      }
    }
  }

  function updateUploadAreaLanguage(t) {
    const actions = ["idle", "struggle", "eatA", "eatB", "eatC", "hungry", "comfort"];
    actions.forEach(action => {
      const block = document.querySelector(`.action-block[data-action="${action}"]`);
      if (!block) return;
  
      const uploadBtn = block.querySelector(".upload-btn");
      const resetBtn = block.querySelector(".reset-btn");
      const label = block.querySelector(".label");
  
      uploadBtn.onclick = () => selectAndUpload(action);
      resetBtn.onclick = async () => {
        await window.gifAPI.resetImage(action);
        await initPreview();
      };
  
      if (label) label.textContent = t.gifActions[action];
      if (uploadBtn) uploadBtn.textContent = t.upload;
      if (resetBtn) resetBtn.textContent = t.reset;
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const settings = await window.settingAPI.getSettings?.();
    const lang = settings?.language || "zh";
    const t = i18n[lang];
  
    updateUploadAreaLanguage(t); // 把原来 actions.forEach 移成函数
    initPreview();
  });
  
  