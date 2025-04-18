window.addEventListener("DOMContentLoaded",async ()=>{
    await refereshModelList();
    document.getElementById("setModelBtn").addEventListener("click",async ()=>{
        const select = document.getElementById("modelSelect")
        const selectedModel = select.value;
        const status = document.getElementById("modelStatus");
        try {
            await window.ollamaAPI.setCurrentModel(selectedModel);
            status.textContent = `当前模型已切换为${selectedModel}`
        } catch (err){
            console.error(err)
            status.textContent = "切换模型失败";
        }
    })
})

async function refereshModelList(){
    const select = document.getElementById("modelSelect");
    const models = await window.ollamaAPI.getAvailableModels();
    select.innerHTML = "";
    models.forEach(m=>{
        const option = document.createElement("option");
        option.value = m;
        option.textContent = m;
        select.appendChild(option)
    });
    const current = await window.ollamaAPI.getCurrentModel();
    select.value = current;
}

async function downloadModel(){
    const modelName = document.getElementById("customModel").value.trim();
    const status = document.getElementById("modelStatus");
    if (!modelName) return status.textContent="模型名不能为空";

    try {
        status.textContent = "正在下载";
        await window.ollamaAPI.downloadModel(modelName);
        await refereshModelList(); //下载成功后刷新页面
        status.textContent = `下载完成并切换为${modelName}`;
    } catch (err){
        status.textContent = "下载失败"+err.message;
    }
}


