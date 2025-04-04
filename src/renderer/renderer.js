document.addEventListener("DOMContentLoaded", () => {
    const functionsContainer = document.querySelector(".functions");
    const petImage = document.querySelector(".petImage");
    const originalSrc = "../assets/Monkey.png"
    const comfortGif = "../assets/comfort.gif"
    const PET_EXHAUSTED_SRC = "../assets/exhausted.gif";
    const Imagecontainer = document.querySelector(".petImageContainer");
    const draggingGif = "../assets/struggle.gif";

    // 点击按钮后隐藏圆点（使用 class 替代 visibility）
    document.querySelectorAll(".functions div").forEach(dot => {
        dot.addEventListener("click", () => {
            console.log("圆点被点击，隐藏");
            functionsContainer.classList.add("hidden");
        });
    });

    // 鼠标移入图片时显示圆点
    petImage.addEventListener("mouseenter", () => {
        functionsContainer.classList.remove("hidden");
      });
      
    petImage.addEventListener("click", () => {
        if (petImage.src.includes("gif")) return; // 避免连续播放
        petImage.src = comfortGif;
        petImage.classList.add("gif-size");

        setTimeout(() => {
            petImage.src = originalSrc;
            petImage.classList.remove("gif-size");
        }, 2500);
    });

    window.dragAPI.onDragStart(() => {
        if (isExhaustedPlaying === true) return; 
        petImage.src = draggingGif;
        petImage.classList.add("gif-size");
      });
    
      window.dragAPI.onDragEnd(() => {
        if (isExhaustedPlaying === false){
            petImage.src = originalSrc;
            petImage.classList.remove("gif-size");
        }
        else{
            petImage.src = PET_EXHAUSTED_SRC;
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






