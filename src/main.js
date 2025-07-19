const {app, BrowserWindow,ipcMain,dialog} = require("electron")
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const {spawn} = require("child_process");
const { error } = require("console");
const http = require("http");
const os = require("os");
const { config } = require("process");


let quotesData = {}
let quoteSourceLabel = "default";
let flaskProcess = null;
let mainwindow;
let todoWindow;
let chatWindow;
let foodWindow;
let infoWindow;
let settingWindow;
let childWindows = {};
let childWindowOffsets = {}; //存储子窗口的自定义偏移量
let isDragging = false;
let dragTimeout;
let rwkvInstance = null;
const notePath = path.join(app.getPath("userData"), "note.txt");
const configDir = path.join(app.getPath('userData'), 'config');

const settingsPath = path.join(configDir, 'settings.json');


const defaultSettingsPath = path.join(process.resourcesPath, "config", "settings.json"); //process.resourcePath打包后安装包所在的路径
if (!fs.existsSync(configDir)){
  fs.mkdirSync(config,{recursive:true}); //recursive表示父目录如果不存在则一起创建
}
if (!fs.existsSync(settingsPath)) {
  fs.copyFileSync(defaultSettingsPath, settingsPath);
}





//数据库文件配置
const userDataPath = app.getPath("userData")
const dbPath = path.join(userDataPath,'todo.db')
const defaultDbPath = path.join(process.resourcesPath,'src','todo.db')

if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(defaultDbPath, dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {  //打开对应db文件
  if (err) console.error("Connect error", err);
  else console.log("Connect successful");
});

db.run(`CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY,
    owner_name TEXT,
    owner_gender TEXT,
    owner_birthday TEXT,
    pet_name TEXT,
    pet_birthday TEXT,
    pet_zodiac TEXT
)`);

db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN)")

//主窗口加载
app.whenReady().then(()=>{
    mainwindow = new BrowserWindow({
        width:300,
        height:280,
        alwaysOnTop:true,
        frame:false,
        transparent: true, // 透明背景
        resizable:false,
        icon: path.join(__dirname,"../goriicon.ico"),
        backgroundColor: "#00FFFFFF",
        webPreferences:{
            preload:path.join(__dirname,'../preload.js'), //预加载脚本
            nodeIntegration:false,
            contextIsolation:true //开启上下文隔离
        }
    })

    mainwindow.loadFile(path.join(__dirname, "./renderer/index.html"));

    watchWindowDrag(mainwindow);
    mainwindow.on("move",()=>{
        updateChildWindowsPosition()
    })
    mainwindow.on('closed',()=>{
        mainwindow = null; //关闭的时候进行清理
    })

    loadQuotes(); //获取语句数据

})


//语句模块
function isValidQuotes(json) { //判断json文件是否有效
  return (
    json && typeof json === "object" &&
    Object.keys(json).length > 0 &&
    Object.values(json).some(group =>
      typeof group === "object" && Object.keys(group).length > 0
    )
  );
}

function loadQuotes() {
  const defaultPath = path.join(__dirname, "features", "talk", "quotes.json");
  const customPath = path.join(app.getPath("userData"), "config", "quotes.json");

  try {
    let targetPath = defaultPath;
    let jsonRaw = "";

    if (fs.existsSync(customPath)) {
      jsonRaw = fs.readFileSync(customPath, "utf-8");
      const parsed = JSON.parse(jsonRaw); //解析json文件
      if (isValidQuotes(parsed)) {
        quotesData = parsed;
        quoteSourceLabel = "自定义";
        targetPath = customPath;
      } else {
        jsonRaw = fs.readFileSync(defaultPath, "utf-8");
        quotesData = JSON.parse(jsonRaw);
        quoteSourceLabel = "默认";
        targetPath = defaultPath;
      }
    } else {
      jsonRaw = fs.readFileSync(defaultPath, "utf-8");
      quotesData = JSON.parse(jsonRaw);
      quoteSourceLabel = "默认";
      targetPath = defaultPath;
    }

    console.log("使用语录文件：", path.basename(targetPath));
  } catch (err) {
    console.error("无法加载语录文件：", err);
    quotesData = {};
    quoteSourceLabel = "未知";
  }
}

//判断窗口是否都关闭
app.on("window-all-closed",()=>{
    if (process.platform !== 'darwin') app.quit();
})

//创建子窗口
async function createChildWindow(name, file, width, height, offsetX, offsetY) {
    for (const key in childWindows) {
        if (childWindows[key] && key !== name) {
            childWindows[key].close(); // 关闭窗口
        }
    }

    if (childWindows[name]) {
        childWindows[name].focus(); //如果已经存在该窗口则聚焦到这个窗口上
        return;
    }

    const mainBounds = mainwindow.getBounds();

    childWindows[name] = new BrowserWindow({
        width,
        height,
        title: name,
        frame:false,
        alwaysOnTop:true,
        transparent: true, // 透明背景
        parent: mainwindow,
        backgroundColor: "#00000000", // 确保透明背景
        resizable: true, // 允许用户调整窗口
        minimizable: false,  //是否可最小化
        resizable:false,
        webPreferences: {
            preload: path.join(__dirname, "../preload.js"),
            contextIsolation: true
        }
    });

    // 设置窗口位置
    childWindows[name].setBounds({
        x: mainBounds.x + offsetX,
        y: mainBounds.y + offsetY,
        width,
        height
    });



    if (name === "chat") {
        mainwindow.webContents.send("chat-loading");
        startFlask();

        // Automatically wait for Flask and Ollama to be ready
        async function waitForFlaskReady(retries = 10, delay = 500) {
          for (let i = 0; i < retries; i++) {
            try {
              const res = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Hello" })
              });
              const data = await res.json();
              console.log("Flask + Ollama are ready. Example reply:", data.reply);
              return data.reply;
            } catch (e) {
              console.log(`Waiting for Flask/Ollama to start... [${i + 1}/${retries}]`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
          throw new Error("Failed to connect to local Flask + Ollama service. Please make sure the backend is running.");
        }
      
        try {
          const result = await waitForFlaskReady();
          mainwindow.webContents.send("chat-loaded")
          console.log("Model is ready. Opening chat window...");
        } catch (err) {
          console.error(err.message);
          return;
        }
      }
      
      
      childWindows[name].loadFile(path.join(__dirname, file));
    
    

// 失去焦点后关闭，但排除切换到主窗口的情况
    if (name !== "chat") {
    childWindows[name].on("blur", () => {
    setTimeout(() => {
        const focused = BrowserWindow.getFocusedWindow();
        if (focused !== mainwindow) {
            if (childWindows[name] && !childWindows[name].isDestroyed()) {
                childWindows[name].close();
            }
        }
    }, 10);
    });
  }

    childWindows[name].on("closed", () => {
        childWindows[name] = null;
        delete childWindowOffsets[name];

        if (name === "chat") {
            if (flaskProcess && !flaskProcess.killed) {
              console.log("Terminating Flask backend...");
              flaskProcess.kill();
              flaskProcess = null;
            }
          }

    });
    

    childWindows[name].on("moved", () => { //移动的时候记录偏移量
        const newBounds = childWindows[name].getBounds();
        childWindowOffsets[name] = {
            xOffset: newBounds.x - mainBounds.x,
            yOffset: newBounds.y - mainBounds.y
        };
    });

    childWindows[name].on("closed", () => {
        childWindows[name] = null;
        delete childWindowOffsets[name]; // 删除记录的偏移量
    });
}

ipcMain.on("open-todo", () => {
    createChildWindow("todo", "features/todo/todo.html", 490, 340, 160, 0);
});

ipcMain.on("open-chat", () => {
    createChildWindow("chat", "features/chat/chat.html", 400, 650, 200, 0);
});

ipcMain.on("open-food", () => {
    createChildWindow("food", "features/food/food.html", 180, 180, 170, 50);
});

ipcMain.on("open-note",()=>{
    createChildWindow("note","features/note/note.html",400,500,230,0);
})


//note模块
// 获取所有任务
ipcMain.handle("getTasks", (event) => {
    console.log("Loading data");
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tasks", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

// 添加任务
ipcMain.handle("addTask", (event, taskText) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO tasks (text, completed) VALUES (?, ?)", [taskText, false], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, text: taskText, completed: false });
        });
    });
});

// 删除任务
ipcMain.handle("deleteTask", (event, taskId) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM tasks WHERE id = ?", [taskId], (err) => {
            if (err) reject(err);
            else resolve({ success: true });
        });
    });
});

//监听投喂事件，传入
ipcMain.on("feed-pet", (event, energy, foodType) => {
    mainwindow.webContents.send("update-energy", energy, foodType); // ✨ 一起发给前端
  });
  
  function updateChildWindowsPosition() {
    if (!mainwindow) return;

    const mainBounds = mainwindow.getBounds();

    for (const key in childWindows) {
        if (childWindows[key] && !childWindows[key].isDestroyed()) {
            let offsetX = 200, offsetY = 0;

            if (key === 'todo') {
                offsetX = 160;
            } else if (key === 'note') {
                offsetX = 230;
            } else if (key === "food"){
              offsetY = 50;
              offsetX = 170;
            } 
            else if (childWindowOffsets[key]) {
                offsetX = childWindowOffsets[key].xOffset ?? 200;
                offsetY = childWindowOffsets[key].yOffset ?? 0;
            }

            const newX = Math.max(0, mainBounds.x + offsetX);
            const newY = Math.max(0, mainBounds.y + offsetY);

            childWindows[key].setBounds({
                x: newX,
                y: newY,
                width: childWindows[key].getBounds().width,
                height: childWindows[key].getBounds().height
            });
        }
    }
}


ipcMain.handle("loadNote", () => {
    if (fs.existsSync(notePath)) {
        return fs.readFileSync(notePath, "utf-8");
    } else {
        return "";
    }
});

// 保存笔记内容
ipcMain.handle("saveNote", (event, content) => {
    fs.writeFileSync(notePath, content, "utf-8");
    return { success: true };
});

ipcMain.handle("exportTxt", async (event, content) => {
    const { filePath } = await dialog.showSaveDialog({
        title: "TXT",
        defaultPath: "note.txt",
        filters: [{ name: "Text Files", extensions: ["txt"] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, content, "utf-8");
        return { success: true };
    }
    return { success: false };
});

ipcMain.handle("exportPdf", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { filePath } = await dialog.showSaveDialog({
        title: "PDF",
        defaultPath: "note.pdf",
        filters: [{ name: "PDF Files", extensions: ["pdf"] }]
    });

    if (filePath) {
        const pdfBuffer = await win.webContents.printToPDF({});
        fs.writeFileSync(filePath, pdfBuffer);
        return { success: true };
    }
    return { success: false };
});


ipcMain.handle("exportMd", async (event, content) => {
    const { filePath } = await dialog.showSaveDialog({
        title: "保存为 Markdown",
        defaultPath: "note.md",
        filters: [{ name: "Markdown", extensions: ["md"] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, content, "utf-8");
        return { success: true };
    }
    return { success: false };
});

ipcMain.on("exit-app",()=>{
    app.quit();
})

ipcMain.on("open-info", () => {
    infoWindow = new BrowserWindow({
        width: 800,
        height: 350,
        title: "Info",
        alwaysOnTop: true,
        transparent: true, // 透明背景
        parent: mainwindow,
        backgroundColor: "#00000000", // 确保透明背景
        resizable: true, // 可调整大小
        minimizable: false, // 不允许最小化
        icon:path.join(__dirname,"assets","icon","goriicon.png"),
        webPreferences: {
            preload: path.join(__dirname, "../preload.js"),
            contextIsolation: true
        }
    });
    infoWindow.setMenuBarVisibility(false);
    infoWindow.removeMenu();
    infoWindow.loadFile(path.join(__dirname, "features/info/info.html"));

    // 可选：关闭时清除引用
    infoWindow.on("closed", () => {
        infoWindow = null;
    });
});

ipcMain.handle("load-profile", async () => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM profile LIMIT 1", (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
  });
  
  ipcMain.handle("save-profile", async (event, info) => {
    db.run(`CREATE TABLE IF NOT EXISTS profile (
      owner_name TEXT,
      owner_gender TEXT,
      owner_birthday TEXT,
      pet_name TEXT,
      pet_birthday TEXT,
      pet_zodiac TEXT
    )`);
  
    db.run("DELETE FROM profile"); // 单条记录，清除旧的
  
    db.run(`INSERT INTO profile (owner_name, owner_gender, owner_birthday, pet_name, pet_birthday, pet_zodiac)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [info.ownerName, info.ownerGender, info.ownerBirthday, info.petName, info.petBirthday, info.petZodiac]
    );
  });
  
// 检查是否为主人或宠物生日
ipcMain.handle("checkBirthday", () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT owner_birthday, pet_birthday FROM profile LIMIT 1", (err, row) => {
      if (err) {
        reject(err);
      } else {
        const today = new Date().toISOString().slice(5, 10); // 获取 MM-DD
        const ownerBirthday = row?.owner_birthday?.slice(5, 10);
        const petBirthday = row?.pet_birthday?.slice(5, 10);

        let message = null;
        if (ownerBirthday === today && ownerBirthday !== petBirthday) message = "Happy Birthday!!!";
        else if (petBirthday === today && petBirthday !== ownerBirthday) message = "今天是我的生日哦！";
        else if (petBirthday === ownerBirthday && petBirthday === today) message = "Happy Birthday!!!缘，妙不可言！"

        resolve(message); // 若非生日则为 null
      }
    });
  });
});

ipcMain.handle("getPendingTasks", (event) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT text FROM tasks WHERE completed = 0", (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.text));
        });
    });
});

function watchWindowDrag(win, startEvent = "pet-drag-start", endEvent = "pet-drag-end", delay = 300) {
    let isDragging = false;
    let dragTimeout;
  
    win.on("move", () => {
      if (!isDragging) {
        isDragging = true;
        win.webContents.send(startEvent);
  
        clearTimeout(dragTimeout);
        dragTimeout = setTimeout(() => {
          win.webContents.send(endEvent);
          isDragging = false;
        }, delay);
      } else {
        clearTimeout(dragTimeout);
        dragTimeout = setTimeout(() => {
          win.webContents.send(endEvent);
          isDragging = false;
        }, delay);
      }
    });
  }


  function waitForFlaskReady(url = "http://localhost:5000/chat", retries = 20, delay = 500) {
    return new Promise((resolve, reject) => {
      const tryConnect = async () => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "ping" })
          });
          const data = await res.json();
          resolve(data.reply);
        } catch (err) {
          if (retries <= 0) return reject("Flask 未启动或 Ollama 无响应");
          setTimeout(() => {
            retries--;
            tryConnect();
          }, delay);
        }
      };
      tryConnect();
    });
  }
  


  ipcMain.handle("send-message-to-ai", async (_event, message) => {
    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      return data.reply;
    } catch (err) {
      return `无法连接本地 AI：${err}`;
    }
  });
  
  
  function startFlask() {
    if (flaskProcess) return;
  
    const flaskExecutable = app.isPackaged
      ? path.join(process.resourcesPath, "backend", "dist", "app.exe")
      : path.join(__dirname, "backend", "dist", "app.exe");
  
    flaskProcess = spawn(flaskExecutable, [], {
      cwd: path.dirname(flaskExecutable),
      detached: true,
      stdio: "ignore",
      windowsHide: true
    });
  
    flaskProcess.unref();
    console.log("Flask app.exe started with PID:", flaskProcess.pid);
  }
  
  
  // 停止 Flask
  function stopFlask() {
    if (flaskProcess && flaskProcess.pid) {
      try {
        if (process.platform === "win32") {
          // Windows 上直接 kill pid
          spawn("taskkill", ["/PID", flaskProcess.pid, "/T", "/F"]);
        } else {
          // macOS / Linux 上 kill 整个进程组
          process.kill(-flaskProcess.pid);
        }
  
        console.log("Flask backend stopped.");
      } catch (err) {
        console.error("无法终止 Flask:", err);
      }
      flaskProcess = null;
    }
  }
  
  // ⬅监听关闭指令（来自渲染进程）
  ipcMain.on("chat-window-close", () => {
    stopFlask(); // 停止 Flask
  
    if (childWindows["chat"] && !childWindows["chat"].isDestroyed()) {
      childWindows["chat"].close();
      childWindows["chat"] = null;
    }
  });
  
  
  

  ipcMain.handle('get-settings', async () => {
    try {
      if (!fs.existsSync(settingsPath)) {
        // 默认设置
        const defaultSettings = {
          language: 'zh',
          model: 'phi',
          transparency: 100,
          autoLaunch: false,
          enableChat: true
        };
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        return defaultSettings;
      }
      const data = fs.readFileSync(settingsPath);
      return JSON.parse(data);
    } catch (err) {
      console.error('读取设置失败:', err);
      return null;
    }
  });
  
  // 保存设置
  ipcMain.handle('save-settings', (event, settings) => {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('设置已保存:', settings);
    } catch (err) {
      console.error('保存设置失败:', err);
    }
  });

  ipcMain.on("open-setting", () => {
    if (settingWindow) {
      settingWindow.focus();
      return;
    }
  
    settingWindow = new BrowserWindow({
      width: 800,
      height: 350,
      title: "Settings",
      alwaysOnTop: true,
      transparent: true,
      parent: mainwindow,
      backgroundColor: "#00000000",
      icon:path.join(__dirname,"assets","icon","goriicon.png"),
      resizable: true,
      minimizable: false,
      webPreferences: {
        preload: path.join(__dirname, "../preload.js"),
        contextIsolation: true
      }
    });
  
    settingWindow.loadFile(path.join(__dirname, "features/setting/setting.html"));
    settingWindow.setMenuBarVisibility(false);
    settingWindow.removeMenu();
  
    settingWindow.on("closed", () => {
      settingWindow = null;
    });
  });

  ipcMain.on('update-transparency', (event, value) => {
    if (mainwindow && mainwindow.webContents) {
      mainwindow.webContents.send('update-transparency', value);
    }
  });

  ipcMain.on("change-talk", (event, value) => {
    if (mainwindow && mainwindow.webContents) {
      mainwindow.webContents.send('update-talk', value); 
    }
  });
  
  
  ipcMain.on('change-language', (event, lang) => {
    if (mainwindow && mainwindow.webContents) {
      mainwindow.webContents.send('change-language', lang);
    }
  });


  const userDir = path.join(app.getPath("userData"), "user");
  let uploadWindow = null;

  ipcMain.on("open-upload-window", async () => {
    if (uploadWindow && !uploadWindow.isDestroyed()) {
      uploadWindow.focus();
      return;
    }

    try{
    startOllama()

    uploadWindow = new BrowserWindow({
      width: 800,
      height: 350,
      title: "Custom",
      icon:path.join(__dirname,"assets","icon","goriicon.png"),
      webPreferences: {
        preload: path.join(__dirname, '../preload.js'),
        contextIsolation: true,
        nodeIntegration: false, // 禁用以确保安全
        enableRemoteModule: false
      }
    });
    
    uploadWindow.setMenuBarVisibility(false);
    uploadWindow.removeMenu();
    uploadWindow.loadFile(path.join(__dirname, 'features/upload/upload.html'));
  
    uploadWindow.on("closed", () => {
      stopOllama();
      uploadWindow = null;
    });
    } catch (error){
      console.log(error.message)
    }
  });


  ipcMain.handle("select-gif", async () => {
    console.log("正在打开文件选择窗口");
    const result = await dialog.showOpenDialog({
      title: "选择一个 GIF 文件",
      filters: [{ name: "Images", extensions: ["gif", "png","jpg"] }],
      properties: ["openFile"]
    });
    console.log("选择结果：", result);
  
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });
  

  ipcMain.on("upload-gif", ({ sender }, { action, filePath }) => {
    const targetDir = path.join(userDir, action);
  
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  
    // 删除旧文件
    fs.readdirSync(targetDir).forEach(file => {
      fs.unlinkSync(path.join(targetDir, file));
    });
  
    // 获取真实扩展名
    const ext = path.extname(filePath); // 例如 .gif 或 .png
    const destPath = path.join(targetDir, "pet" + ext);
  
    fs.copyFileSync(filePath, destPath);
    console.log(`${action} 文件已替换: ${destPath}`);
  });

  ipcMain.handle("get-pet-image", (_event, action) => {
    const gifPath = path.join(userDir, action, "pet.gif");
    const pngPath = path.join(userDir, action, "pet.png");
    const jpgPath = path.join(userDir, action, "pet.jpg"); // ✅ 你已声明
    const fallback = path.join(userDir, action, "Gorilla.png");
  
    if (fs.existsSync(gifPath)) return "file://" + gifPath.replace(/\\/g, "/");
    if (fs.existsSync(pngPath)) return "file://" + pngPath.replace(/\\/g, "/");
    if (fs.existsSync(jpgPath)) return "file://" + jpgPath.replace(/\\/g, "/"); // ✅ 添加这行
  
    return "file://" + fallback.replace(/\\/g, "/");
  });
  

  ipcMain.handle("get-custom-gif-path", (_event, action = "idle") => {
    const dirPath = path.join(userDir, action)
  
    if (!fs.existsSync(dirPath)) return null;
  
    const files = fs.readdirSync(dirPath);
    const image = files.find(f => /\.(gif|png|jpg)$/i.test(f)); // 支持 gif/png/jpg
    if (image) {
      return "file://" + path.join(dirPath, image).replace(/\\/g, "/");
    }
  
    return null;
  });
  

const defaultMap = {
  idle: "Gorilla.png",
  struggle: "struggle.gif",
  eatA: "banana.gif",
  eatB: "cola.gif",
  eatC: "yogurt.gif",
  hungry: "exhausted.gif",
  comfort: "comfort.gif"
};

ipcMain.handle("get-current-image", (event, action) => {
  const userPath = path.join(userDir, action)
  const gif = path.join(userPath, "pet.gif");
  const png = path.join(userPath, "pet.png");
  const jpg = path.join(userPath, "pet.jpg");

  if (fs.existsSync(gif)) return "file://" + gif;
  if (fs.existsSync(png)) return "file://" + png;
  if (fs.existsSync(jpg)) return "file://" + jpg;

  const fallbackFile = defaultMap[action] || "Monkey.png";
  const fallbackPath = path.join(__dirname, "./assets", fallbackFile);
  return "file://" + fallbackPath;
});

ipcMain.on("reset-gif", (event, action) => {
  const targetDir = path.join(userDir, action);
  if (fs.existsSync(targetDir)) {
    fs.readdirSync(targetDir).forEach(file => {
      fs.unlinkSync(path.join(targetDir, file));
    });
    console.log(`${action} 已重置为默认`);
  }
});

let menuWindow;

ipcMain.on("open-menu", () => {
  menuWindow = new BrowserWindow({
    width: 400,
    height: 500,
    title: "Menu Window",
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  menuWindow.loadFile(path.join(__dirname, 'features/menu/menu.html'));

  // 关闭事件监听放在创建之后
  menuWindow.on("closed", () => {
    menuWindow = null;
  });
});

// main.js
ipcMain.handle("get-quotes", () => {
  return quotesData;
});

ipcMain.handle("get-quotes-source",()=>{return quoteSourceLabel})


ipcMain.handle("upload-custom-quotes",async ()=>{
  try {
    const {canceled,filePaths} = await dialog.showOpenDialog({
      title:"选择自定义语录JSON文件",
      filters:[{name:"JSON文件",extensions:["json"]}],
      properties:["openFile"]
    });

    if (canceled || filePaths.length === 0){
      return {success:false,message:"用户取消"}
    }
    const sourcePath = filePaths[0];
    const destPath = path.join(app.getPath("userData"), "config", "quotes.json")

    const content = fs.readFileSync(sourcePath,'utf-8');
    const parsed = JSON.parse(content);

    if (!parsed.zh && !parsed.en){
      return {success:false,message:"文件格式无效"}
    }
    fs.writeFileSync(destPath,JSON.stringify(parsed,null,2),'utf-8');
    return {success:true};
  } catch (err){
    console.error("Failure to upload",err);
    return {success:false,message:err.message}
  }
});

ipcMain.handle("reset-custom-quotes", () => {
  const customPath = path.join(app.getPath("userData"), "config", "quotes.json");
  try {
    if (fs.existsSync(customPath)) {
      fs.unlinkSync(customPath); // 删除自定义语录
      console.log("Has been delete");
      return { success: true };
    } else {
      return { success: false, message: "File not exist" };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
});


ipcMain.on("save-personality",(event,content)=>{
  const personalityPath = path.join(app.getPath("userData"), "config", "personality.txt");
  try {
    fs.writeFileSync(personalityPath,content.trim(),'utf-8');
    console.log("personality has been updated")
  } catch(err){
    console.error("cannot update the personality:",err)
  }
})

ipcMain.handle("get-personality",async ()=>{
  const filepath = path.join(app.getPath("userData"),"config","personality.txt")
  try {
    return fs.readFileSync(filepath,'utf-8')
  } catch(err){
    return ""
  }
})

const baseBackendPath = app.isPackaged
  ? path.join(process.resourcesPath, "backend")
  : path.join(__dirname, "backend");

const modelDir = path.join(baseBackendPath, "ollama", "models");
const modelRoot = modelDir;
const modelListFile = path.join(baseBackendPath, "downloaded_models.txt");
const currentModelPath = path.join(baseBackendPath, "current_model.txt");
let currentModel = "Owen:0.5b";

ipcMain.handle("get-available-models", async () => {
  if (!fs.existsSync(modelListFile)) return [];

  const lines = fs.readFileSync(modelListFile, "utf-8")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return Array.from(new Set(lines));
});

ipcMain.handle("get-current-model", () => {
  if (fs.existsSync(currentModelPath)) {
    return fs.readFileSync(currentModelPath, "utf-8").trim();
  } else {
    return "qwen:0.5b";
  }
});

ipcMain.on("set-current-model", (_e, name) => {
  currentModel = name;
  console.log("The model has been changed:", name);
  fs.writeFileSync(currentModelPath, name, "utf-8");
});

let ollamaProcess = null;

function startOllama() {
  const ollamaExe = path.join(baseBackendPath, "ollama", "ollama.exe");

  const env = {
    ...process.env,
    OLLAMA_MODELS: modelDir
  };

  ollamaProcess = spawn(ollamaExe, ["serve"], {
    cwd: path.dirname(ollamaExe),
    env,
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });

  ollamaProcess.unref();
  console.log("🚀 Ollama started, PID:", ollamaProcess.pid);
}

function stopOllama() {
  if (ollamaProcess && ollamaProcess.pid) {
    try {
      process.kill(ollamaProcess.pid, 0);
      process.kill(ollamaProcess.pid);
      console.log("Exit Ollama");
    } catch (err) {
      if (err.code === "ESRCH") {
        console.warn("Ollama has been exited");
      } else {
        console.error("Cannot exit Ollama:", err);
      }
    } finally {
      ollamaProcess = null;
    }
  }
}

ipcMain.handle("download-model", async (_e, modelName) => {
  const modelExe = path.join(baseBackendPath, "ollama", "ollama.exe");

  if (!fs.existsSync(modelExe)) {
    throw new Error("ollama.exe is not existed");
  }

  if (!fs.existsSync(modelRoot)) {
    fs.mkdirSync(modelRoot, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      OLLAMA_MODELS: modelRoot
    };

    const cmd = spawn(modelExe, ["pull", modelName], {
      cwd: path.dirname(modelExe),
      env
    });

    cmd.stdout.on("data", d => console.log("Ok", d.toString()));
    cmd.stderr.on("data", d => console.error("No", d.toString()));

    cmd.on("close", code => {
      if (code === 0) {
        console.log(`模型 ${modelName} Download Successfully`);
        currentModel = modelName;
        const modelPath = path.join(modelRoot, "manifests", "registry.ollama.ai", "library", modelName.split(":")[0]);
        console.log(`✅ 模型 ${modelName} 下载成功，存储路径为：\n${modelPath}`);
        saveDownloadedModel(modelName);
        resolve();
      } else {
        reject(new Error("Cannot download the model"));
      }
    });
  });
});

function saveDownloadedModel(name) {
  let existing = [];
  if (fs.existsSync(modelListFile)) {
    existing = fs.readFileSync(modelListFile, "utf-8").split("\n").filter(Boolean);
  }
  if (!existing.includes(name)) {
    fs.appendFileSync(modelListFile, name + "\n", "utf-8");
  }
}

















  






  
  
  

  



  
  









