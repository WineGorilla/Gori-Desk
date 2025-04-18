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
    openInfo:()=>ipcRenderer.send("open-info"),
    openUpload:()=>{ipcRenderer.send("open-upload-window")}
});

contextBridge.exposeInMainWorld("talkAPI", {
    checkBirthday: () => ipcRenderer.invoke("checkBirthday"),
    getPendingTasks: () => ipcRenderer.invoke("getPendingTasks"),
    getQuotes: () => {
      return ipcRenderer.invoke("get-quotes");
    },
    uploadQuotes: () => ipcRenderer.invoke("upload-custom-quotes"),
    resetQuotes:()=>ipcRenderer.invoke("reset-custom-quotes"),
    getQuoteSource:()=>ipcRenderer.invoke("get-quotes-source")
  });

  contextBridge.exposeInMainWorld("dragAPI", {
    onDragStart: (callback) => ipcRenderer.on("pet-drag-start", callback),
    onDragEnd: (callback) => ipcRenderer.on("pet-drag-end", callback)
  });

  contextBridge.exposeInMainWorld("chatAI", {
    sendMessage: (message) => ipcRenderer.invoke("send-message-to-ai", message),
    notifyClose: () => ipcRenderer.send("chat-window-close")
  });
  

  contextBridge.exposeInMainWorld('settingAPI', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
    openSetting: () => ipcRenderer.send('open-setting'),
  
    sendTransparencyToMain: (value) => ipcRenderer.send('update-transparency', value),
    onTransparencyChange: (callback) => ipcRenderer.on('update-transparency', (event, value) => {
      callback(value);
    }),
  
    onLanguageChange: (callback) => {
      ipcRenderer.on('change-language', (event, lang) => {
        callback(lang);
      });
    },
  
    changeLanguage: (lang) => ipcRenderer.send('change-language', lang)
  });

  contextBridge.exposeInMainWorld("gifAPI", {
    uploadGIF: (action, filePath) => ipcRenderer.send("upload-gif", { action, filePath }),
    selectGifFile: () => ipcRenderer.invoke("select-gif"),
    getCurrentImage: (action) => ipcRenderer.invoke("get-current-image", action),
    resetImage: (action) => ipcRenderer.send("reset-gif", action)
  });

contextBridge.exposeInMainWorld("petAPI", {
  getPetImage: (action) => ipcRenderer.invoke("get-pet-image", action),
  getCustomGifPath: (action) => ipcRenderer.invoke("get-custom-gif-path", action),
});


contextBridge.exposeInMainWorld("wholemenuAPI", {
  openMenuWindow: () => {
    ipcRenderer.send("open-menu");
  }
});

contextBridge.exposeInMainWorld("ollamaAPI", {
  getAvailableModels: () => ipcRenderer.invoke("get-available-models"),
  downloadModel: (modelName) => ipcRenderer.invoke("download-model", modelName),
  setCurrentModel: (modelName) => ipcRenderer.send("set-current-model", modelName),
  getCurrentModel: () => ipcRenderer.invoke("get-current-model")
});


  
  
  

