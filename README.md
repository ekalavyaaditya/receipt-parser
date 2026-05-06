# Receipt Parser Take-Home

Lean full-stack receipt parser designed to show practical product judgment in a short assignment window.

## Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + TypeScript
- Persistence: local JSON file
- LLM parsing: OpenAI Responses API with image input + JSON schema

## Why this shape

- JSON persistence is faster than SQLite for a 3-4 hour assignment and still demonstrates save/load flows.
- The UI spends more effort on review and correction than on upload visuals because that is where product judgment shows up.
- The API is intentionally thin: upload, parse, list, update.
- Confidence and warnings are first-class so the app can handle imperfect model output honestly.

## Run locally

### Server

1. `cd server`
2. `npm install`
3. Set `OPENAI_API_KEY`
4. `npm run dev`

### Client

1. `cd client`
2. `npm install`
3. `npm run dev`

Server runs on `http://localhost:3001`
Client runs on Vite default `http://localhost:5173`

## API

- `GET /health`
- `GET /receipts`
- `POST /receipts/parse`
- `PUT /receipts/:id`

## Notes for submission

- This implementation uses the model's native image understanding for OCR + parsing in one pass to stay lean.
- A production version would likely separate OCR and structured extraction, add validation rules, and keep the source image.
