// 🌍 多语言语录配置
let quotes = {}

let currentLang = "zh"; // 默认语言

// 🚀 页面加载后初始化
window.addEventListener("DOMContentLoaded", async () => {
  const settings = await window.settingAPI.getSettings();
  quotes = await window.talkAPI.getQuotes();
  currentLang = settings.language || "zh";

  // ✅ 生日提示（如有）
  if (window.talkAPI?.checkBirthday) {
    const message = await window.talkAPI.checkBirthday();
    if (message) displayTalk(message);
  }

  // ✅ 启动自动说话
  startRandomTalking();
});

// 📦 获取语录
function getRandomQuote(type = "default") {
  const langQuotes = quotes[currentLang] || quotes.zh;
  const list = langQuotes[type];
  if (!list || list.length === 0) return currentLang === "zh" ? "（暂无语录）" : "(No quote available)";
  return list[Math.floor(Math.random() * list.length)];
}

// 💬 展示对话气泡
function displayTalk(message) {
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;

  bubble.textContent = message;
  bubble.style.opacity = 1;

  setTimeout(() => {
    bubble.style.opacity = 0;
  }, 4000);
}

// 🤖 定时自动说话逻辑
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
        ? `📌 嘿~你还有没完成的任务：「${randomTask}」要不要现在做一下？`
        : `📌 Hey! You still have a task: "${randomTask}". Wanna do it now?`;
      displayTalk(message);
    }
  });
}

// 🌐 监听语言切换（设置页面通知主窗口）
window.settingAPI.onLanguageChange((lang) => {
  currentLang = lang;
  console.log("🗣️ 语录语言已切换为:", lang);
});

  


  
  