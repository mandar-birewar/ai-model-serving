# AI Model Serving Project

An end-to-end AI application that serves multiple Hugging Face models through a FastAPI backend and consumes them from a React frontend built with Vite and raw CSS.

## What This Demonstrates

- Serving multiple Hugging Face models using FastAPI
- Creating separate API endpoints for sentiment analysis, text summarization, and text generation
- Building a React frontend using Vite
- Styling the frontend using raw CSS
- Connecting frontend forms with backend APIs
- End-to-end AI application development
- Deployment-ready frontend and backend structure

## Project Architecture

```text
React Frontend (Vite)
        |
        v
FastAPI Backend
        |
        v
Hugging Face Models
```

## Folder Structure

```text
ai-model-serving-project/
|
├── backend/
│   ├── app.py
│   └── requirements.txt
|
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
|
└── README.md
```

## Backend API Endpoints

| Method | Endpoint | Task | Hugging Face Model |
| --- | --- | --- | --- |
| GET | `/health` | Health check | None |
| POST | `/api/sentiment` | Sentiment analysis | `distilbert-base-uncased-finetuned-sst-2-english` |
| POST | `/api/summarize` | Summarization | `sshleifer/distilbart-cnn-12-6` |
| POST | `/api/generate` | Text generation | `distilgpt2` |

## Run Locally

### 1. Start the Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

Open the interactive API docs at:

```text
http://127.0.0.1:8000/docs
```

The first request to each endpoint may take longer because the Hugging Face model is downloaded and loaded.

### 2. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

Vite proxies `/api` requests to the FastAPI backend.

## Example API Requests

### Sentiment

```bash
curl -X POST http://127.0.0.1:8000/api/sentiment ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"This project is easy to understand and useful.\"}"
```

### Summarization

```bash
curl -X POST http://127.0.0.1:8000/api/summarize ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Artificial intelligence applications often combine a frontend, backend, and model layer. The frontend collects user input, the backend validates the request, and the model produces a prediction or generated response. This project demonstrates that full flow using React, FastAPI, and Hugging Face models.\"}"
```

### Text Generation

```bash
curl -X POST http://127.0.0.1:8000/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"A production AI model serving system should\",\"max_new_tokens\":60}"
```

## Deployment

### Backend Deployment

Good options include Render, Railway, Hugging Face Spaces, Azure App Service, or an AWS EC2 instance.

Typical backend start command:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

For platforms that provide a dynamic port, use the platform's `$PORT` variable in the start command.

### Frontend Deployment

Good options include Vercel, Netlify, Render Static Sites, or GitHub Pages.

Build command:

```bash
npm run build
```

Build output directory:

```text
dist
```

Set this environment variable in the deployed frontend:

```text
VITE_API_BASE_URL=https://your-backend-url.com
```

## Notes

- Keep the backend running before using the frontend.
- The backend uses CORS so the local Vite frontend can call FastAPI.
- Hugging Face models are cached after first download.
- CPU inference works, but model loading can take time on the first run.
