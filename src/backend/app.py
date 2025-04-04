from flask import Flask,request,jsonify
import requests,os,subprocess,time

app = Flask(__name__)

def start_ollama():
    base = os.path.dirname(__file__)
    exe = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ollama", "ollama.exe"))

    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ollama", "models"))

    env = os.environ.copy()
    env["OLLAMA_MODELS"] = model_path

    subprocess.Popen([exe, "serve"], cwd=os.path.dirname(exe), env=env)

start_ollama()
time.sleep(2)

history = []

@app.route('/chat', methods=['POST'])
def chat():
    user_msg = request.get_json().get("message", "")
    history.append(f"User: {user_msg}")

    prompt = "\n".join(history[-5:])  # 最近5轮
    prompt += "\nAI:"

    res = requests.post("http://localhost:11434/api/generate", json={
        "model": "phi",
        "prompt": prompt,
        "stream": False
    })

    reply = res.json()["response"]
    history.append(f"AI: {reply}")
    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(port=5000)