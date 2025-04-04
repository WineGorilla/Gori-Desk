document.addEventListener("DOMContentLoaded", () => {
    const battery = document.querySelector(".battery");
    const menu = document.getElementById("custom-menu");

    // ✅ 右键显示菜单
    battery.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        menu.style.display = "block";
    });

    // ✅ 点击其他地方关闭菜单
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) {
            menu.style.display = "none";
        }
    });

    // ✅ 窗口失焦也隐藏菜单
    window.addEventListener("blur", () => {
        menu.style.display = "none";
    });

    // ✅ 点击菜单项自动关闭
    menu.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            menu.style.display = "none";
        });
    });

    document.getElementById("menu-exit").addEventListener("click",()=>{
        window.menuAPI.exitApp();
    })

    document.getElementById("menu-info").addEventListener("click",()=>{
        window.menuAPI.openSetting();
    })
});




  