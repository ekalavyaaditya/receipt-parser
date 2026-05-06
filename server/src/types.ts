export type ConfidenceLevel = "high" | "medium" | "low";

export interface ReceiptItem {
  id: string;
  name: string;
  amount: number | null;
  confidence: ConfidenceLevel;
}

export interface ReceiptFields {
  merchantName: string;
  date: string;
  total: number | null;
  lineItems: ReceiptItem[];
}

export interface FieldConfidence {
  merchantName: ConfidenceLevel;
  date: ConfidenceLevel;
  total: ConfidenceLevel;
  lineItems: ConfidenceLevel;
}

export interface ParsedReceipt {
  fields: ReceiptFields;
  confidence: FieldConfidence;
  warnings: string[];
  rawTextSummary: string;
}

export interface SavedReceipt {
  id: string;
  imageName: string;
  imageMimeType: string;
  createdAt: string;
  updatedAt: string;
  status: "parsed" | "reviewed";
  parsed: ParsedReceipt;
}

