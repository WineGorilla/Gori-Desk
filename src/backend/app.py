from flask import Flask,request,jsonify
import requests,os,subprocess,time

app = Flask(__name__)

def start_ollama():
    base = os.path.dirname(__file__)
    exe = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ollama", "ollama.exe"))

    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ollama", "models"))

    env = os.environ.copy()
    subprocess.Popen([exe, "serve"], cwd=os.path.dirname(exe), env=env)

start_ollama()
time.sleep(1)

history = []

@app.route('/chat', methods=['POST'])
def chat():
    user_msg = request.get_json().get("message", "")
    history.append(f"User: {user_msg}")
    personality = get_personality();
    prompt = "[System Instruction]\n" + personality.strip() + "\n\n" + "\n".join(history[-5:]) + "\nAI:"
    model_file = get_current_model();
    print(f"Current model: {model_file}")
    res = requests.post("http://localhost:11434/api/generate", json={
        "model": model_file,
        "prompt": prompt,
        "stream": False
    })
    reply = res.json()["response"]
    history.append(f"AI: {reply}")
    return jsonify({"reply": reply})

def get_current_model():
    base = os.path.dirname(__file__)  # 当前 app.py 所在目录
    filepath = os.path.join(base, "current_model.txt")  # backend/current_model.txt
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read().strip()
    
def get_personality():
    base = os.path.dirname(__file__)
    filepath = os.path.join(base,"personality.txt")
    if os.path.exists(filepath):
        with open(filepath,'r',encoding='utf-8') as f:
            return f.read().strip()
    return ""
    
@app.route('/current-model', methods=['GET'])
def current_model():
    return jsonify({"current_model": get_current_model()})

    

if __name__ == "__main__":
    app.run(port=5000)