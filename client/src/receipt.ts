export type ConfidenceLevel = "high" | "medium" | "low";

export type ReceiptItem = {
  id: string;
  name: string;
  amount: number | null;
  confidence: ConfidenceLevel;
};

export type Receipt = {
  id: string;
  imageName: string;
  status: "parsed" | "reviewed";
  updatedAt: string;
  parsed: {
    fields: {
      merchantName: string;
      date: string;
      total: number | null;
      lineItems: ReceiptItem[];
    };
    confidence: {
      merchantName: ConfidenceLevel;
      date: ConfidenceLevel;
      total: ConfidenceLevel;
      lineItems: ConfidenceLevel;
    };
    warnings: string[];
    rawTextSummary: string;
  };
};

export function badgeClasses(level: ConfidenceLevel) {
  if (level === "high") return "bg-emerald-100 text-emerald-800";
  if (level === "medium") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}
