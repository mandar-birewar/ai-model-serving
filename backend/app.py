from functools import lru_cache
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import pipeline


app = FastAPI(
    title="AI Model Serving API",
    description="FastAPI service exposing multiple Hugging Face models for different AI tasks.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=2000)


class GenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=500)
    max_new_tokens: int = Field(default=60, ge=10, le=120)


@lru_cache(maxsize=1)
def sentiment_model():
    return pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


@lru_cache(maxsize=1)
def summarization_model():
    return pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")


@lru_cache(maxsize=1)
def generation_model():
    return pipeline("text-generation", model="distilgpt2")


@app.get("/")
def root() -> Dict[str, str]:
    return {
        "message": "AI Model Serving API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/sentiment")
def analyze_sentiment(request: TextRequest):
    try:
        result = sentiment_model()(request.text)[0]
        return {
            "task": "sentiment-analysis",
            "input": request.text,
            "label": result["label"],
            "score": round(float(result["score"]), 4),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/summarize")
def summarize_text(request: TextRequest):
    if len(request.text.split()) < 35:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 35 words so the summarization model has enough context.",
        )

    try:
        result = summarization_model()(
            request.text,
            max_length=90,
            min_length=25,
            do_sample=False,
        )[0]
        return {
            "task": "summarization",
            "input": request.text,
            "summary": result["summary_text"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/generate")
def generate_text(request: GenerationRequest):
    try:
        result = generation_model()(
            request.prompt,
            max_new_tokens=request.max_new_tokens,
            num_return_sequences=1,
            pad_token_id=50256,
        )[0]
        return {
            "task": "text-generation",
            "prompt": request.prompt,
            "generated_text": result["generated_text"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
