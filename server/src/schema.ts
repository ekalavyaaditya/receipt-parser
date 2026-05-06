import { z } from "zod";

const confidenceSchema = z.enum(["high", "medium", "low"]);

export const llmReceiptSchema = z.object({
  merchantName: z.string().default(""),
  date: z.string().default(""),
  total: z.number().nullable().default(null),
  lineItems: z
    .array(
      z.object({
        name: z.string().default(""),
        amount: z.number().nullable().default(null),
        confidence: confidenceSchema.default("medium")
      })
    )
    .default([]),
  confidence: z.object({
    merchantName: confidenceSchema.default("medium"),
    date: confidenceSchema.default("medium"),
    total: confidenceSchema.default("medium"),
    lineItems: confidenceSchema.default("medium")
  }),
  warnings: z.array(z.string()).default([]),
  rawTextSummary: z.string().default("")
});

export type LlmReceiptResponse = z.infer<typeof llmReceiptSchema>;

