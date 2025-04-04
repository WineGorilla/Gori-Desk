const {contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('myAPI',{
    openChat:()=>{ipcRenderer.send("open-chat")},
    openTodo:()=>ipcRenderer.send("open-todo"),
    openFoodWindow: () => ipcRenderer.send("open-food"),
    openNote:()=>{ipcRenderer.send("open-note")},
})

contextBridge.exposeInMainWorld("profileAPI", {
  loadProfile: () => ipcRenderer.invoke("load-profile"),
  saveProfile: (info) => ipcRenderer.invoke("save-profile", info),
});


contextBridge.exposeInMainWorld("databaseAPI",{
    getTasks: () => ipcRenderer.invoke("getTasks"),
    addTask: (taskText) => ipcRenderer.invoke("addTask", taskText),
    deleteTask: (taskId) => ipcRenderer.invoke("deleteTask", taskId)
})

//根据：事件：函数/数值进行编写
contextBridge.exposeInMainWorld("eatAPI", {
    feedPet: (energy, foodType) => ipcRenderer.send("feed-pet", energy, foodType),
    onEnergyUpdate: (callback) =>
      ipcRenderer.on("update-energy", (event, energy, foodType) => callback(energy, foodType))
  });
  
contextBridge.exposeInMainWorld("noteAPI", {
    loadNote: () => ipcRenderer.invoke("loadNote"),
    saveNote: (content) => ipcRenderer.invoke("saveNote", content),
    exportTxt: (content) => ipcRenderer.invoke("exportTxt", content),
    exportPdf: () => ipcRenderer.invoke("exportPdf"),
    exportMd: (content) => ipcRenderer.invoke("exportMd", content)
});

contextBridge.exposeInMainWorld("menuAPI", {
    exitApp: () => ipcRenderer.send("exit-app"),
    openSetting:()=>ipcRenderer.send("open-setting")
});

contextBridge.exposeInMainWorld("talkAPI", {
    checkBirthday: () => ipcRenderer.invoke("checkBirthday"),
    getPendingTasks: () => ipcRenderer.invoke("getPendingTasks")
  });

  contextBridge.exposeInMainWorld("dragAPI", {
    onDragStart: (callback) => ipcRenderer.on("pet-drag-start", callback),
    onDragEnd: (callback) => ipcRenderer.on("pet-drag-end", callback)
  });

  contextBridge.exposeInMainWorld("chatAI", {
    sendMessage: async (message) => {
      const result = await ipcRenderer.invoke("send-message-to-ai", message);
      return result;
    }
  });
  

