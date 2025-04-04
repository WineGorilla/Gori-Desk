document.addEventListener("DOMContentLoaded", async () => {
    const textarea = document.getElementById("note-area");
    const dropdown = document.querySelector(".dropdown");
    const exportBtn = document.querySelector(".export-btn");

    // 显示/隐藏下拉菜单
    exportBtn.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
    });

    // 点击其他地方隐藏菜单
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".export-container")) {
            dropdown.style.display = "none";
        }
    });

    // 加载已有内容
    const content = await window.noteAPI.loadNote();
    textarea.value = content;

    // 自动保存
    let saveTimeout;
    textarea.addEventListener("input", () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            window.noteAPI.saveNote(textarea.value);
        }, 500);
    });

    document.querySelector(".close-btn").addEventListener("click",()=>{
        window.close();
    })

    textarea.addEventListener("blur", () => {
        window.noteAPI.saveNote(textarea.value);
    });

    // 导出为 TXT
    document.getElementById("exportTxt").addEventListener("click", async () => {
        await window.noteAPI.exportTxt(textarea.value);
        alert("TXT 导出成功！");
    });

    // 导出为 PDF
    document.getElementById("exportPdf").addEventListener("click", async () => {
        await window.noteAPI.exportPdf();
        alert("PDF 导出成功！");
    });

    document.getElementById("exportMd").addEventListener("click", async () => {
        await window.noteAPI.exportMd(document.getElementById("note-area").value);
        alert("Markdown 导出成功！");
    });
    
});

