// 🌍 多语言语录配置
const quotes = {
  zh: {
    default: [
      "你好呀！今天又是元气满满的一天！",
      "陪陪我吧，我有点无聊了～",
      "你在做什么呢？我好想知道！"
    ],
    lowEnergy: [
      "我好累啊...能给我点吃的吗？",
      "精力快耗尽了，再不喂我我可要晕倒啦～"
    ],
    highEnergy: [
      "我现在超有劲！快带我玩吧！",
      "嗨嗨嗨～动起来动起来～"
    ]
  },
  en: {
    default: [
      "Hi there! It's a brand new day!",
      "Stay with me~ I'm a bit bored.",
      "What are you doing? I want to know!"
    ],
    lowEnergy: [
      "I'm so tired... Can I have something to eat?",
      "My energy is low... I'm going to faint if you don't feed me!"
    ],
    highEnergy: [
      "I'm full of energy! Let's play!",
      "Yooo! Time to move!"
    ]
  }
};

let currentLang = "zh"; // 默认语言

// 🚀 页面加载后初始化
window.addEventListener("DOMContentLoaded", async () => {
  const settings = await window.settingAPI.getSettings();
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
  }, 1500); // 每 15 秒执行一次
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

  


  
  