# 🐵 Gorilla Desktop Pet

**Gorilla Desktop Pet** is a cute, interactive desktop companion built with Electron.  
It features energy tracking, feeding animations, draggable states, and popup windows like todo, note, and chat.  
It also supports **offline AI chat** via local models such as RWKV or Ollama.

---

## ✨ Features

- 🪫 Energy system (with battery and exhausted states)
- 🍌 Feeding animation (banana, cola, yogurt)
- 💬 Chat window (RWKV / Ollama support)
- 📋 Todo list window
- 📝 Note-taking window
- 🧲 Dragging animation (struggle)
- 💻 Works fully offline
- ⚙️ Modular architecture, easy to expand

---

## 📦 Download

> **Large files like `ollama.exe` and models are NOT included in this repo** due to GitHub size limits.

### 🔧 You must manually place them like this:

```
src/
├─ ollama/
│   ├─ ollama.exe            # Ollama executable
│   └─ models/               # Your RWKV or other models
```

- 🔗 [Download Ollama Executable](https://ollama.com/)
- 🔗 [Get RWKV / Ollama Models](https://huggingface.co/) *(use your model link)*

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Place the required executable and models

📂 Place your `ollama.exe` and model files under `src/ollama/`  
📂 将 `ollama.exe` 与模型文件手动放入 `src/ollama/` 文件夹中。

### 3. Start the app

```bash
npm start
```

> If you use local AI, make sure your local server is started first (e.g. Flask / Ollama backend).

---

## 🗂️ Project Structure

```
src/
├─ assets/           # Images / GIFs (eating, exhausted, etc.)
├─ features/         # Chat, todo, note sub-windows
├─ renderer/         # Main UI & pet interaction
├─ ollama/           # Holds ollama.exe and models
├─ preload.js        # Secure API bridge
├─ main.js           # Electron main process
```

---

## 📷 Screenshots

> *(Insert pet screenshots and animations here)*  
> 示例：宠物吃香蕉 / 拖动挣扎 / 聊天窗口 / 待办窗口 等

---

## 🛠️ Packaging

To build the `.exe` or `.dmg` app:

```bash
npm run build
```

> Requires configuration via `electron-builder` in `package.json`

---

## 📜 License

MIT License © 2025 [WineGorilla](https://github.com/WineGorilla)
