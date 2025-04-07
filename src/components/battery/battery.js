const MAX_ENERGY = 100;
const MIN_ENERGY = 10;
const EXHAUSTED_THRESHOLD = 20;
const EXHAUSTED_REFRESH_INTERVAL = 3000; //每隔多久刷新虚弱状态
const ANIMATION_DURATION = 2500; //吃东西动画时间

let petEnergy = MAX_ENERGY; 
let isExhaustedPlaying = false; //是否处于虚弱状态
let exhaustedInterval = null;

const petImg = document.querySelector(".petImage");
const energyText = document.getElementById("pet-energy");
const batteryLevel = document.getElementById("battery-level");

const gifMap = {
  banana: "../assets/banana.gif",
  cola: "../assets/cola.gif",
  yogurt: "../assets/yogurt.gif"
};

const PET_NORMAL_SRC = "../assets/Monkey.png";
const PET_EXHAUSTED_SRC = "../assets/exhausted.gif";

// ----------------- UI 更新 ------------------
function updateEnergyUI() {
  if (!energyText || !batteryLevel) return;

  energyText.textContent = petEnergy;

  const energyPercent = (petEnergy / MAX_ENERGY) * 100;
  batteryLevel.style.height = `${energyPercent}%`;

  batteryLevel.style.background =
    petEnergy >= 70 ? "limegreen" :
    petEnergy >= 30 ? "orange" : "red";

  updateExhaustedState();
}

function updateExhaustedState() {
    const shouldExhaust = petEnergy <= EXHAUSTED_THRESHOLD;
  
    if (shouldExhaust) {
      if (!isExhaustedPlaying) {
        startExhaustedLoop();
      } 
    } else if (isExhaustedPlaying) {
      stopExhaustedLoop();
    }
  }
  

// ----------------- 能量变化 ------------------
function increaseEnergy(amount, foodType = "banana") {
  petEnergy = Math.min(MAX_ENERGY, petEnergy + amount);
  updateEnergyUI();
  playEatingAnimation(foodType);
}

function decreaseEnergy() {
  petEnergy = Math.max(MIN_ENERGY, petEnergy - 10);
  updateEnergyUI();
}

// ----------------- 动画控制 ------------------
function playEatingAnimation(foodType) {
    if (!petImg) return;
  
    const gifSrc = gifMap[foodType] || gifMap["banana"];
    if (petImg.src.endsWith(gifSrc)) return;
  
    petImg.src = gifSrc;
    petImg.classList.add("gif-size");
  
    setTimeout(() => {
      if (isExhaustedPlaying) {
        petImg.src = PET_EXHAUSTED_SRC;
      } else {
        petImg.src = PET_NORMAL_SRC;
        petImg.classList.remove("gif-size");
      }
    }, ANIMATION_DURATION);
  }
  
  function startExhaustedLoop() {
    if (!petImg) return;
    isExhaustedPlaying = true;
    window.isExhaustedPlaying = true;
    petImg.src = PET_EXHAUSTED_SRC;
    petImg.classList.add("gif-size")
  }
  
  function stopExhaustedLoop() {
    isExhaustedPlaying = false;
    window.isExhaustedPlaying = false;
  
    if (petImg) {
      petImg.classList.remove("gif-size");
      petImg.src = PET_NORMAL_SRC;
    }
  }


// ----------------- 事件监听 ------------------
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("circle")) {
    increaseEnergy(10);
  }
});

window.eatAPI?.onEnergyUpdate((energy, foodType) => {
  increaseEnergy(energy, foodType);
});


// ----------------- 定时能量消耗 ------------------
setInterval(decreaseEnergy, 10000); // 建议调回更合理的时间（如 10 秒减 10）



