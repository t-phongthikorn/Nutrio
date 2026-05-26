from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from typing import List
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


model = pickle.load(open(BASE_DIR / "model.pkl", "rb"))
label_encoder = pickle.load(open(BASE_DIR / "label_encoder.pkl", "rb"))
embedder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 หรือใส่ frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    titles: List[str]

class Result(BaseModel):
    text: str
    label: str
    confidence: float

def classify_with_fallback(text: str, threshold=0.6):
    vec = embedder.encode([text])

    probs = model.predict_proba(vec)
    pred = probs.argmax(axis=1)

    label = label_encoder.inverse_transform(pred)[0]
    confidence = probs.max()

    if confidence < threshold:
        return {
            "label": "อื่น ๆ",
            "confidence": float(confidence)
        }

    return {
        "label": label,
        "confidence": float(confidence)
    }

@app.post("/")
def predict(data: InputData):
    results = []

    for text in data.titles:
        res = classify_with_fallback(text)

        results.append({
            "text": text,
            "label": res["label"],
        })

    return {
        "results": results
    }