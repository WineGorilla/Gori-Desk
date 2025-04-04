const {app, BrowserWindow,ipcMain,dialog} = require("electron")
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const RWKV = require("rwkv-cpp-node");
const {spawn} = require("child_process")

let flaskProcess = null;
let mainwindow;
let todoWindow;
let chatWindow;
let foodWindow;
let settingWindow;
let childWindows = {};
let childWindowOffsets = {}; //存储子窗口的自定义偏移量
let isDragging = false;
let dragTimeout;
const rwkvModelPath = path.join("C:", "Users", "Ricar", "NYU", "q8_0-RWKV-4-Raven-7B-v12-Eng49%25-Chn49%25-Jpn1%25-Other1%25-20230530-ctx8192.bin");
let rwkvInstance = null;
const notePath = path.join(__dirname,"note.txt");

const db = new sqlite3.Database(path.join(__dirname,"todo.db"),(err)=>{
    if (err) console.error("Connect error")
    else console.log("Connect successful")
})

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

app.whenReady().then(()=>{
    mainwindow = new BrowserWindow({
        width:300,
        height:280,
        alwaysOnTop:true,
        frame:false,
        transparent: true, // 透明背景
        resizable:false,
        backgroundColor: "#00FFFFFF",
        webPreferences:{
            preload:path.join(__dirname,'../preload.js'),
            nodeIntegration:false,
            contextIsolation:true
        }
    })

    mainwindow.loadFile(path.join(__dirname, "./renderer/index.html"));
    watchWindowDrag(mainwindow);
    mainwindow.on("move",()=>{
        updateChildWindowsPosition()
    })
    mainwindow.on('closed',()=>{
        mainwindow = null;
    })
})

app.on("window-all-closed",()=>{
    if (process.platform !== 'darwin') app.quit();
})

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

        startFlask();

        // 🔁 Automatically wait for Flask and Ollama to be ready
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
          console.log("✅ Model is ready. Opening chat window...");
        } catch (err) {
          console.error(err.message);
          return;
        }
      }
      
      
      childWindows[name].loadFile(path.join(__dirname, file));
    
    

// 👇 失去焦点后关闭，但排除切换到主窗口的情况
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

    childWindows[name].on("closed", () => {
        childWindows[name] = null;
        delete childWindowOffsets[name];

        if (name === "chat") {
            if (flaskProcess && !flaskProcess.killed) {
              console.log("🛑 Terminating Flask backend...");
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
    createChildWindow("food", "features/food/food.html", 300, 400, 200, 0);
});

ipcMain.on("open-note",()=>{
    createChildWindow("note","features/note/note.html",400,500,200,0);
})

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
            let offsetX = childWindowOffsets[key]?.xOffset ?? 200;  // 默认 X 偏移量
            let offsetY = childWindowOffsets[key]?.yOffset ?? 0;    // 默认 Y 偏移量

            // 防止窗口跑出屏幕外
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
        title: "保存为 TXT",
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
        title: "导出为 PDF",
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

ipcMain.on("open-setting", () => {
    settingWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: "setting",
        alwaysOnTop: true,
        transparent: true, // 透明背景
        parent: mainwindow,
        backgroundColor: "#00000000", // 确保透明背景
        resizable: true, // 可调整大小
        minimizable: false, // 不允许最小化
        webPreferences: {
            preload: path.join(__dirname, "../preload.js"),
            contextIsolation: true
        }
    });

    settingWindow.loadFile(path.join(__dirname, "features/setting/info.html"));

    // 可选：关闭时清除引用
    settingWindow.on("closed", () => {
        settingWindow = null;
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
        if (ownerBirthday === today && ownerBirthday !== petBirthday) message = "🎉 祝主人生日快乐！";
        else if (petBirthday === today && petBirthday !== ownerBirthday) message = "🎂 今天是我的生日喔～";
        else if (petBirthday === ownerBirthday && petBirthday === today) message = "主人，今天我们都过生日！缘，妙不可言！"

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

function watchWindowDrag(win, startEvent = "pet-drag-start", endEvent = "pet-drag-end", delay = 800) {
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


  function waitForFlaskReady(url = "http://localhost:5000/chat", retries = 10, delay = 500) {
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
          if (retries <= 0) return reject("❌ Flask 未启动或 Ollama 无响应");
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
      return `❌ 无法连接本地 AI：${err}`;
    }
  });
  
  function startFlask() {
    if (flaskProcess) return; // 避免重复启动
  
    flaskProcess = spawn("python", ["backend/app.py"], {
      cwd: __dirname,
      shell: true,
      detached: true,
      stdio: "ignore"
    });
  
    console.log("🚀 Flask backend started...");
  }
  



  
  









