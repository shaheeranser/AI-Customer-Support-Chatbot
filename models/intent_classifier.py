"""
Intent Classification - TensorFlow / Keras Training
----------------------------------------------------
Fine-tunes DistilBERT using TensorFlow, no Accelerate dependency.
"""

import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification

# ===============================
# 1. LOAD DATA
# ===============================
df = pd.read_csv("your_dataset.csv")  # <-- replace path
df.dropna(subset=["instruction", "intent"], inplace=True)

# Features / Labels
X = df["instruction"].tolist()
y = df["intent"].tolist()

# Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Train / Validation split
train_texts, val_texts, train_labels, val_labels = train_test_split(
    X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
)

# ===============================
# 2. TOKENIZATION
# ===============================
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

def tokenize_data(texts, labels):
    encodings = tokenizer(texts, truncation=True, padding=True, max_length=128)
    return dict(encodings), labels

train_encodings, train_labels = tokenize_data(train_texts, train_labels)
val_encodings, val_labels = tokenize_data(val_texts, val_labels)

# Convert to tf.data.Dataset
train_dataset = tf.data.Dataset.from_tensor_slices((
    {key: tf.constant(val) for key, val in train_encodings.items()},
    tf.constant(train_labels)
)).shuffle(1000).batch(16)

val_dataset = tf.data.Dataset.from_tensor_slices((
    {key: tf.constant(val) for key, val in val_encodings.items()},
    tf.constant(val_labels)
)).batch(16)

# ===============================
# 3. MODEL
# ===============================
model = TFDistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(label_encoder.classes_)
)

optimizer = tf.keras.optimizers.Adam(learning_rate=5e-5)
loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
metrics = [tf.keras.metrics.SparseCategoricalAccuracy("accuracy")]

model.compile(optimizer=optimizer, loss=loss, metrics=metrics)

# ===============================
# 4. TRAIN
# ===============================
history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=3
)

# ===============================
# 5. CONFUSION MATRIX
# ===============================
# Get predictions
preds = model.predict(val_dataset)
pred_labels = tf.argmax(preds.logits, axis=1).numpy()

cm = confusion_matrix(val_labels, pred_labels)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=label_encoder.classes_)
disp.plot(cmap=plt.cm.Blues, xticks_rotation=45)
plt.title("Confusion Matrix - Intent Classification (TF)")
plt.show()

# ===============================
# 6. QUICK INFERENCE
# ===============================
sample_text = "how do I cancel my order?"
inputs = tokenizer(sample_text, return_tensors="tf", truncation=True, padding=True)

outputs = model(**inputs)
predicted_class_id = int(tf.argmax(outputs.logits, axis=1).numpy()[0])
predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]

print(f"💡 Sample Query: '{sample_text}'")
print(f"🎯 Predicted Intent: {predicted_label}")
