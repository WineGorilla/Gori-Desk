let quotes = {
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
  };
  
  function getRandomQuote(type = "default") {
    const list = quotes[type];
    if (!list || list.length === 0) return "（暂无语录）";
    return list[Math.floor(Math.random() * list.length)];
  }
  
  function displayTalk(message) {
    const bubble = document.getElementById("speech-bubble");
    if (!bubble) return;
  
    bubble.textContent = message;
    bubble.style.opacity = 1;

    setTimeout(() => {
      bubble.style.opacity = 0;
    }, 4000);
  }
  
  function startRandomTalking() {
    setInterval(() => {
      const random = Math.random();
      if (random < 0.25) {
        checkTasksAndRemind();  // 25% 概率提醒任务
      } else {
        const energy = window.petEnergy ?? 50;
        const type = energy < 30 ? "lowEnergy" : energy > 70 ? "highEnergy" : "default";
        displayTalk(getRandomQuote(type));
      }
    }, 1500); 
  }
  
  function checkTasksAndRemind() {
    window.talkAPI.getPendingTasks().then(tasks => {
      if (tasks.length > 0) {
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        const message = `📌 嘿~你还有没完成的任务：「${randomTask}」要不要现在做一下？`;
        displayTalk(message);
      }
    });
  }
  
  // ✅ 页面加载完自动启动
  window.addEventListener("DOMContentLoaded", async () => {
    if (window.talkAPI?.checkBirthday) {
        const message = await window.talkAPI.checkBirthday();
        if (message) {
          displayTalk(message); // 用你现有的显示对话气泡函数
        }
      }
    startRandomTalking();
  });
  
  