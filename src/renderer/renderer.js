document.addEventListener("DOMContentLoaded", async () => {
    const functionsContainer = document.querySelector(".functions");
    const petImage = document.querySelector(".petImage");

    let originalSrc;
    let gifMap = {};

    // ✅ 加载所有动作图像路径（如果有自定义优先）
    async function loadPetGifs() {
        const fallback = (local) => `../assets/${local}`;
        gifMap = {
            idle: await window.petAPI.getCustomGifPath("idle") || fallback("Gorilla.png"),
            comfort: await window.petAPI.getCustomGifPath("comfort") || fallback("comfort.gif"),
            struggle: await window.petAPI.getCustomGifPath("struggle") || fallback("struggle.gif"),
            exhausted: await window.petAPI.getCustomGifPath("exhausted") || fallback("exhausted.gif")
        };
        originalSrc = gifMap.idle;
        petImage.src = originalSrc;
    }

    await loadPetGifs();

    // 🟢 鼠标进入显示功能按钮
    petImage.addEventListener("mouseenter", () => {
        functionsContainer.classList.remove("hidden");
    });

    // 🔵 点击宠物播放 comfort 动画
    petImage.addEventListener("click", () => {
        if (petImage.src.includes("gif")) return;
        petImage.src = gifMap.comfort;
        petImage.classList.add("gif-size");

        setTimeout(() => {
            petImage.src = originalSrc;
            petImage.classList.remove("gif-size");
        }, 2500);
    });

    // 🔘 点击按钮后隐藏圆点
    document.querySelectorAll(".functions img").forEach(dot => {
        dot.addEventListener("click", () => {
            functionsContainer.classList.add("hidden");
        });
    });

    // 🟥 拖动状态动画（通过外部 window.dragAPI 控制）
    window.dragAPI.onDragStart(() => {
        if (isExhaustedPlaying === true) return;
        petImage.src = gifMap.struggle;
        petImage.classList.add("gif-size");
    });

    window.dragAPI.onDragEnd(() => {
        if (isExhaustedPlaying === false) {
            petImage.src = originalSrc;
            petImage.classList.remove("gif-size");
        } else {
            petImage.src = gifMap.exhausted;
        }
    });

    // 功能按钮绑定事件
    document.querySelector(".record").addEventListener("click", () => {
        window.myAPI.openTodo();
    });
    document.querySelector(".chat").addEventListener("click", () => {
        window.myAPI.openChat();
    });
    document.querySelector(".eat").addEventListener("click", () => {
        window.myAPI.openFoodWindow();
    });
    document.querySelector(".note").addEventListener("click", () => {
        window.myAPI.openNote();
    });
});








