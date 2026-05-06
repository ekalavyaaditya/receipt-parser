import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { parseReceiptImage } from "./openai.js";
import { getReceipts, saveReceipt } from "./store.js";
import { SavedReceipt } from "./types.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const uploadDir = path.resolve("data", "uploads");

function toBusinessErrorMessage(error: Error) {
  const message = error.message.toLowerCase();

  if (message.includes("429") || message.includes("quota") || message.includes("billing")) {
    return "Receipt parsing is temporarily unavailable because the AI service limit has been reached. Please try again later or contact support.";
  }

  if (message.includes("api key")) {
    return "Receipt parsing is not configured right now. Please check the server setup and try again.";
  }

  return error.message;
}

await mkdir(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (_, file, callback) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error("Only JPG and PNG files are supported."));
  }
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/receipts", async (_, res, next) => {
  try {
    const receipts = await getReceipts();
    res.json({ receipts });
  } catch (error) {
    next(error);
  }
});

app.post("/receipts/parse", upload.single("receipt"), async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.LLM_API_KEY) {
      res.status(500).json({ error: "Missing GEMINI_API_KEY in server environment." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Receipt image is required." });
      return;
    }

    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const parsed = await parseReceiptImage(dataUrl);
    const now = new Date().toISOString();

    const receipt: SavedReceipt = {
      id: randomUUID(),
      imageName: req.file.originalname,
      imageMimeType: req.file.mimetype,
      createdAt: now,
      updatedAt: now,
      status: "parsed",
      parsed
    };

    await saveReceipt(receipt);
    res.status(201).json({ receipt });
  } catch (error) {
    next(error);
  }
});

app.put("/receipts/:id", async (req, res, next) => {
  try {
    const receipts = await getReceipts();
    const existing = receipts.find((item) => item.id === req.params.id);

    if (!existing) {
      res.status(404).json({ error: "Receipt not found." });
      return;
    }

    const updated: SavedReceipt = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString(),
      status: "reviewed"
    };

    await saveReceipt(updated);
    res.json({ receipt: updated });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error(error);

  if (error instanceof Error) {
    res.status(500).json({ error: toBusinessErrorMessage(error) });
    return;
  }

  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
