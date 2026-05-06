import { llmReceiptSchema } from "./schema.js";
import { ParsedReceipt } from "./types.js";

const primaryModel = process.env.GEMINI_MODEL || process.env.LLM_MODEL || "gemini-2.5-flash";
const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash-lite")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const candidateModels = [primaryModel, ...fallbackModels.filter((model) => model !== primaryModel)];

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in server environment.");
  }

  return apiKey;
}

function parseDataUrl(base64DataUrl: string) {
  const match = base64DataUrl.match(/^data:(.+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid receipt image format.");
  }

  return {
    mimeType: match[1],
    data: match[2]
  };
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 503;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestGemini(model: string, apiKey: string, mimeType: string, data: string) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: extractionPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Extract the receipt into the agreed JSON shape."
            },
            {
              inlineData: {
                mimeType,
                data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            merchantName: { type: "STRING" },
            date: { type: "STRING" },
            total: { type: "NUMBER", nullable: true },
            lineItems: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  amount: { type: "NUMBER", nullable: true },
                  confidence: {
                    type: "STRING",
                    enum: ["high", "medium", "low"]
                  }
                },
                required: ["name", "amount", "confidence"]
              }
            },
            confidence: {
              type: "OBJECT",
              properties: {
                merchantName: {
                  type: "STRING",
                  enum: ["high", "medium", "low"]
                },
                date: {
                  type: "STRING",
                  enum: ["high", "medium", "low"]
                },
                total: {
                  type: "STRING",
                  enum: ["high", "medium", "low"]
                },
                lineItems: {
                  type: "STRING",
                  enum: ["high", "medium", "low"]
                }
              },
              required: ["merchantName", "date", "total", "lineItems"]
            },
            warnings: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            rawTextSummary: { type: "STRING" }
          },
          required: [
            "merchantName",
            "date",
            "total",
            "lineItems",
            "confidence",
            "warnings",
            "rawTextSummary"
          ]
        }
      }
    })
  });
}

const extractionPrompt = `
You are parsing a retail receipt image into structured JSON.

Return only the requested fields.
If a value is unclear, use an empty string or null and lower confidence.
Do not invent line items or totals.
Dates should be ISO-like when possible, for example 2026-05-06.
Amounts should be numbers without currency symbols.

Confidence rules:
- high: clearly visible and unambiguous
- medium: mostly readable with small uncertainty
- low: blurry, cropped, or inferred

Warnings should explain likely issues such as:
- total missing
- date unreadable
- line items incomplete
- tax/service charge ambiguity

rawTextSummary should be a brief OCR-style summary of visible content, not a full transcript.
`.trim();

function normalizeParsedReceipt(parsed: ReturnType<typeof llmReceiptSchema.parse>): ParsedReceipt {
  return {
    fields: {
      merchantName: parsed.merchantName,
      date: parsed.date,
      total: parsed.total,
      lineItems: parsed.lineItems.map((item, index) => ({
        id: `item-${index + 1}`,
        name: item.name,
        amount: item.amount,
        confidence: item.confidence
      }))
    },
    confidence: parsed.confidence,
    warnings: parsed.warnings,
    rawTextSummary: parsed.rawTextSummary
  };
}

export async function parseReceiptImage(base64DataUrl: string): Promise<ParsedReceipt> {
  const apiKey = getApiKey();
  const { mimeType, data } = parseDataUrl(base64DataUrl);
  let response: Response | null = null;
  let lastError = "";

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      response = await requestGemini(model, apiKey, mimeType, data);

      if (response.ok) {
        break;
      }

      const errorText = await response.text();
      lastError = `Gemini request failed for ${model}: ${response.status} ${errorText}`;

      if (!isRetryableStatus(response.status) || attempt === 3) {
        break;
      }

      await sleep(700 * attempt);
    }

    if (response?.ok) {
      break;
    }
  }

  if (!response?.ok) {
    throw new Error(lastError || "Gemini request failed.");
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const rawOutput = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!rawOutput) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsedJson = llmReceiptSchema.parse(JSON.parse(rawOutput));
  return normalizeParsedReceipt(parsedJson);
}
