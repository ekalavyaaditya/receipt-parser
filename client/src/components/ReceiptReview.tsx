import { Receipt } from "../receipt";
import { FieldCard } from "./FieldCard";
import { LineItemsTable } from "./LineItemsTable";

type ReceiptReviewProps = {
  draft: Receipt;
  isSaving: boolean;
  onSave: () => void;
  onUpdateField: (field: "merchantName" | "date", value: string) => void;
  onUpdateTotal: (value: string) => void;
  onUpdateLineItem: (index: number, updates: { name?: string; amount?: number | null }) => void;
};

export function ReceiptReview({ draft, isSaving, onSave, onUpdateField, onUpdateTotal, onUpdateLineItem }: ReceiptReviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="m-0 text-2xl font-semibold">Review extracted fields</h2>
          <p className="mt-2 text-sm text-stone-600">
            Low-confidence fields are highlighted so reviewers know where to spend attention first.
          </p>
        </div>
        <button type="button" onClick={onSave} disabled={isSaving} className="rounded-xl bg-calm px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isSaving ? "Saving..." : "Save corrections"}
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <FieldCard
          label="Merchant"
          confidence={draft.parsed.confidence.merchantName}
          value={draft.parsed.fields.merchantName}
          onChange={(value) => onUpdateField("merchantName", value)}
        />
        <FieldCard label="Date" confidence={draft.parsed.confidence.date} value={draft.parsed.fields.date} onChange={(value) => onUpdateField("date", value)} />
        <FieldCard
          label="Total"
          confidence={draft.parsed.confidence.total}
          value={draft.parsed.fields.total?.toString() ?? ""}
          onChange={onUpdateTotal}
        />
      </section>

      <LineItemsTable items={draft.parsed.fields.lineItems} confidence={draft.parsed.confidence.lineItems} onUpdateItem={onUpdateLineItem} />

      {draft.parsed.warnings.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="m-0 text-base font-semibold text-amber-900">Model warnings</h3>
          <ul className="mb-0 mt-2 space-y-1 pl-5 text-sm text-amber-900">
            {draft.parsed.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <h3 className="m-0 text-base font-semibold">OCR summary</h3>
        <p className="mb-0 mt-2 text-sm text-stone-600">{draft.parsed.rawTextSummary || "No summary available."}</p>
      </section>
    </div>
  );
}
