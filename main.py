from flask import Flask, request, jsonify, render_template
import tensorflow as tf
from transformers import T5Tokenizer, TFT5ForConditionalGeneration, AutoTokenizer, TFAutoModelForSequenceClassification

app = Flask(__name__, static_url_path="/static", static_folder="static")

# Load Models
intent_model_name = "./models/intent_classification_model"
intent_tokenizer = AutoTokenizer.from_pretrained(intent_model_name)
intent_model = TFAutoModelForSequenceClassification.from_pretrained(intent_model_name)

response_model_name = "./models/response_generation_model"
response_tokenizer = T5Tokenizer.from_pretrained(response_model_name)
response_model = TFT5ForConditionalGeneration.from_pretrained(response_model_name)

# Utils
def classify_intent(query):
    inputs = intent_tokenizer(query, return_tensors="tf", truncation=True, padding=True)
    outputs = intent_model(**inputs)
    predicted_class = int(tf.argmax(outputs.logits, axis=-1).numpy()[0])
    intent_map = {
        0: "cancel_order", 
        1: "demand_refund", 
        2: "goodbye", 
        3: "greeting", 
        4: "order_status", 
        5: "order_tracking", 
        6: "out_of_scope", 
        7: "payment_issue", 
        8: "review_order",
        9: "submit_complaint",
        10: "talk_to_human"
    }
    return intent_map.get(predicted_class, "unknown")

def generate_response(intent, query, temperature=0.7):
    input_text = f"intent: {intent} | query: {query}"
    inputs = response_tokenizer(input_text, return_tensors="tf", padding=True, truncation=True)
    outputs = response_model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=50,
        do_sample=True,
        temperature=temperature
    )
    return response_tokenizer.decode(outputs[0], skip_special_tokens=True)

# Routes for Pages
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

@app.route("/home")
def home():
    return render_template("home.html")

# API Route
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' in request"}), 400

    query = data["query"]
    intent = classify_intent(query)
    response = generate_response(intent, query)

    return jsonify({
        "intent": intent,
        "response": response
    })

# Run App
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
