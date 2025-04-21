// 多语言语录配置
let quotes = {}
let loadingInterval = null;
let isLoading = false;
let currentLang = "zh"; // 默认语言
let talkingEnabled = false;


// 页面加载后初始化
window.addEventListener("DOMContentLoaded", async () => {
  const settings = await window.settingAPI.getSettings();
  talkingEnabled = settings.enableChat;
  quotes = await window.talkAPI.getQuotes();
  currentLang = settings.language || "zh";

  // 生日提示（如有）
  if (window.talkAPI?.checkBirthday) {
    const message = await window.talkAPI.checkBirthday();
    if (message) displayTalk(message);
  }

  // 启动自动说话
  if (talkingEnabled){
    startRandomTalking();
  }

  window.settingAPI.onTalkChange((value) => {
    talkingEnabled = value;
    if (talkingEnabled) {
      startRandomTalking();
    } else {
      stopRandomTalking();
    }
  });
});

// 获取语录
function getRandomQuote(type = "default") {
  const langQuotes = quotes[currentLang] || quotes.zh;
  const list = langQuotes[type];
  if (!list || list.length === 0) return currentLang === "zh" ? "（暂无语录）" : "(No quote available)";
  return list[Math.floor(Math.random() * list.length)];
}

// 展示对话气泡
function displayTalk(message) {
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;

  if (isLoading && !force) return; // ⛔️ 加载中时，不显示除 loading 外的气泡

  bubble.textContent = message;
  bubble.style.opacity = 1;

  setTimeout(() => {
    bubble.style.opacity = 0;
  }, 4000);
}

// 定时自动说话逻辑
function startRandomTalking() {
  setInterval(() => {
    const random = Math.random();
    if (random < 0.25) {
      checkTasksAndRemind(); // 25% 提醒任务
    } else {
      const energy = window.petEnergy ?? 50;
      const type = energy < 30 ? "lowEnergy" : energy > 70 ? "highEnergy" : "default";
      displayTalk(getRandomQuote(type));
    }
  }, 1500); 
}

// 📌 检查任务并提醒
function checkTasksAndRemind() {
  window.talkAPI.getPendingTasks().then(tasks => {
    if (tasks.length > 0) {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      const message = currentLang === "zh"
        ? `嘿~你还有没完成的任务：「${randomTask}」`
        : `Hey! You still have a task: "${randomTask}"`;
      displayTalk(message);
    }
  });
}

// 🌐 监听语言切换（设置页面通知主窗口）
window.settingAPI.onLanguageChange((lang) => {
  currentLang = lang;
  console.log("语录语言已切换为:", lang);
});

function startLoadingBubble() {
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;

  let dotCount = 0;
  loadingInterval = setInterval(() => {
    const dots = ".".repeat(dotCount % 4);
    const message = currentLang === "zh" ? `正在加载中${dots}` : `Loading${dots}`;
    bubble.textContent = message;
    bubble.style.opacity = 1;
    dotCount++;
  }, 500);
}

// 结束 loading，改为加载成功提示 + 自动隐藏
function stopLoadingBubble() {
  clearInterval(loadingInterval);
  loadingInterval = null;

  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;

  const message = currentLang === "zh" ? "模型加载完成" : "Model loaded";
  bubble.textContent = message;

  setTimeout(() => {
    bubble.style.opacity = 0;
  }, 3000);
}

// 开始加载
window.talkAPI.onChatLoading(() => {
  isLoading = true;
  startLoadingBubble();
});

// 加载完毕
window.talkAPI.onChatLoaded(() => {
  isLoading = false;
  stopLoadingBubble();
});



  


  
  