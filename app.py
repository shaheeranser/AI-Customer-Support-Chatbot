
import os
import requests
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Point this to the AI Developer's service when it's ready
AI_API_URL = os.getenv("AI_API_URL", "").strip()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    user_message = data.get("message", "").strip()
    user_id = data.get("user_id", "guest")
    profile = data.get("profile", {})

    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    # If an AI API is configured, forward the request
    if AI_API_URL:
        try:
            # Contract with AI service
            payload = {
                "message": user_message,
                "user_id": user_id,
                "profile": profile,
                "metadata": {"source": "web-app"}
            }
            resp = requests.post(AI_API_URL, json=payload, timeout=15)
            resp.raise_for_status()
            ai_json = resp.json()
            # Expecting at least {"response": "..."} from AI
            text = ai_json.get("response") or ai_json.get("answer") or ""
            if not text:
                text = "[AI service returned no text]"
            return jsonify({
                "response": text,
                "raw": ai_json
            })
        except Exception as e:
            return jsonify({"response": f"[AI service error] {e}"}), 502

    # Fallback: echo stub while AI API isn't ready
    return jsonify({"response": f"You said: {user_message} (stubbed response)"}), 200

if __name__ == "__main__":
    # Run dev server
    app.run(host="127.0.0.1", port=5000, debug=True)
