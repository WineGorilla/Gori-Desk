const MAX_ENERGY = 100;
const MIN_ENERGY = 10;
const EXHAUSTED_THRESHOLD = 20;
const ANIMATION_DURATION = 2500;
const ENERGY_DECAY_INTERVAL = 120000;

let petEnergy = MAX_ENERGY;
let isExhaustedPlaying = false;
let exhaustedInterval = null;
window.isExhaustedPlaying = false;

const petImg = document.querySelector(".petImage");
const energyText = document.getElementById("pet-energy");
const batteryLevel = document.getElementById("battery-level");

let gifMap = {};

async function loadPetGifs() {
  const fallback = (name) => `../assets/${name}`;
  gifMap = {
    banana: await window.petAPI.getCustomGifPath("eatA") || fallback("banana.gif"),
    cola: await window.petAPI.getCustomGifPath("eatB") || fallback("cola.gif"),
    yogurt: await window.petAPI.getCustomGifPath("eatC") || fallback("yogurt.gif"),
    normal: await window.petAPI.getCustomGifPath("idle") || fallback("Gorilla.png"),
    exhausted: await window.petAPI.getCustomGifPath("struggle") || fallback("exhausted.gif")
  };
}

function updateEnergyUI() {
  if (!energyText || !batteryLevel) return;
  energyText.textContent = petEnergy;
  const percent = (petEnergy / MAX_ENERGY) * 100;
  batteryLevel.style.height = `${percent}%`;
  batteryLevel.style.background =
    petEnergy >= 70 ? "limegreen" :
    petEnergy >= 30 ? "orange" : "red";
  updateExhaustedState();
}

function updateExhaustedState() {
  const shouldExhaust = petEnergy <= EXHAUSTED_THRESHOLD;
  if (shouldExhaust && !isExhaustedPlaying) startExhaustedLoop();
  else if (!shouldExhaust && isExhaustedPlaying) stopExhaustedLoop();
}

function increaseEnergy(amount, foodType = "banana") {
  petEnergy = Math.min(MAX_ENERGY, petEnergy + amount);
  updateEnergyUI();
  playEatingAnimation(foodType);
}

function decreaseEnergy() {
  petEnergy = Math.max(MIN_ENERGY, petEnergy - 5);
  updateEnergyUI();
}

function playEatingAnimation(foodType) {
  if (!petImg) return;
  const gifSrc = gifMap[foodType] || gifMap["banana"];
  petImg.src = gifSrc;
  petImg.classList.add("gif-size");
  setTimeout(() => {
    petImg.src = isExhaustedPlaying ? gifMap.exhausted : gifMap.normal;
    petImg.classList.remove("gif-size");
  }, ANIMATION_DURATION);
}

function startExhaustedLoop() {
  isExhaustedPlaying = true;
  window.isExhaustedPlaying = true;
  petImg.src = gifMap.exhausted;
  petImg.classList.add("gif-size");
}

function stopExhaustedLoop() {
  isExhaustedPlaying = false;
  window.isExhaustedPlaying = false;
  petImg.classList.remove("gif-size");
  petImg.src = gifMap.normal;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPetGifs();
  petImg.src = gifMap.normal;
  updateEnergyUI();
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("circle")) increaseEnergy(10);
});

window.eatAPI?.onEnergyUpdate((energy, foodType) => {
  increaseEnergy(energy, foodType);
});

setInterval(decreaseEnergy, ENERGY_DECAY_INTERVAL);




