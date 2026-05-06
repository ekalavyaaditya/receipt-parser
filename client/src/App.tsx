import { DragEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { EmptyReceiptState } from "./components/EmptyReceiptState";
import { ErrorBanner } from "./components/ErrorBanner";
import { ReceiptReview } from "./components/ReceiptReview";
import { ReceiptSidebar } from "./components/ReceiptSidebar";
import { Receipt, ReceiptItem } from "./receipt";

const API_BASE = "http://localhost:3001";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Receipt | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    void fetchReceipts();
  }, []);

  async function fetchReceipts() {
    const response = await fetch(`${API_BASE}/receipts`);
    const data = await response.json();
    setReceipts(data.receipts);
    if (!activeReceiptId && data.receipts[0]) {
      selectReceipt(data.receipts[0]);
    }
  }

  function selectReceipt(receipt: Receipt) {
    setActiveReceiptId(receipt.id);
    setDraft(structuredClone(receipt));
  }

  function updateDraftFields(nextFields: Partial<Receipt["parsed"]["fields"]>) {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        parsed: {
          ...current.parsed,
          fields: {
            ...current.parsed.fields,
            ...nextFields
          }
        }
      };
    });
  }

  function updateLineItem(index: number, updates: Partial<Pick<ReceiptItem, "name" | "amount">>) {
    setDraft((current) => {
      if (!current) return current;

      const nextItems = [...current.parsed.fields.lineItems];
      nextItems[index] = { ...nextItems[index], ...updates };

      return {
        ...current,
        parsed: {
          ...current.parsed,
          fields: {
            ...current.parsed.fields,
            lineItems: nextItems
          }
        }
      };
    });
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch(`${API_BASE}/receipts/parse`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");

      await fetchReceipts();
      selectReceipt(data.receipt);
      setFile(null);
      uploadFormRef.current?.reset();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    if (!draft) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/receipts/${draft.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(draft)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed.");

      await fetchReceipts();
      selectReceipt(data.receipt);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleFileSelect(nextFile: File | null) {
    setError(null);
    setFile(nextFile);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (!droppedFile) return;

    if (!["image/png", "image/jpeg"].includes(droppedFile.type)) {
      setError("Only JPG and PNG files are supported.");
      setFile(null);
      return;
    }

    setError(null);
    setFile(droppedFile);
  }

  function openFilePicker() {
    uploadInputRef.current?.click();
  }

  function handleUploadZoneKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  const activeReceipt = receipts.find((receipt) => receipt.id === activeReceiptId) || null;
  const hasReceiptContent = receipts.length > 0 || !!draft || !!activeReceipt;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff9ed,_#f7f3ea_55%)] text-ink">
      <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 xl:px-12 2xl:py-16">
        <AppHeader />

        {error ? <ErrorBanner message={error} /> : null}

        {hasReceiptContent ? (
          <section className="mb-6 rounded-3xl border border-stone-200 bg-white/90 p-4 shadow-sm">
            <form ref={uploadFormRef} onSubmit={handleUpload} className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={handleUploadZoneKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`cursor-pointer rounded-2xl border border-dashed px-4 py-4 transition ${
                  isDragging
                    ? "border-accent bg-amber-50 shadow-[0_0_0_4px_rgba(180,83,9,0.12)]"
                    : "border-stone-300 bg-stone-50 hover:border-accent hover:bg-amber-50/70"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-medium text-stone-800 md:text-base">
                      {file ? "Ready to upload another receipt" : isDragging ? "Drop receipt image here" : "Add another receipt"}
                    </p>
                    <p className="mb-0 mt-1 truncate text-sm text-stone-500">
                      {file ? file.name : "Drag and drop a PNG or JPG, or click here to browse without leaving the current review."}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800">
                    {isDragging ? "Drop now" : "Choose file"}
                  </span>
                </div>
              </div>

              <input
                ref={uploadInputRef}
                id="receipt-upload-inline"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
                className="sr-only"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="m-0 text-sm text-stone-500">Upload a new receipt at any time. Your current corrections stay visible until the new parse finishes.</p>
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? "Parsing..." : "Upload selected receipt"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className={hasReceiptContent ? "grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]" : ""}>
          {hasReceiptContent ? <ReceiptSidebar receipts={receipts} activeReceiptId={activeReceiptId} onSelectReceipt={selectReceipt} /> : null}

          <main className={`rounded-3xl border border-stone-200 bg-white p-5 shadow-sm xl:p-7 ${hasReceiptContent ? "xl:min-h-[640px]" : "mx-auto max-w-5xl"}`}>
            {!draft || !activeReceipt ? (
              <EmptyReceiptState
                file={file}
                isDragging={isDragging}
                isUploading={isUploading}
                uploadInputRef={uploadInputRef}
                onSubmit={handleUpload}
                onFileChange={handleFileSelect}
                onOpenFilePicker={openFilePicker}
                onUploadZoneKeyDown={handleUploadZoneKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ) : (
              <ReceiptReview
                draft={draft}
                isSaving={isSaving}
                onSave={handleSave}
                onUpdateField={(field, value) => updateDraftFields({ [field]: value })}
                onUpdateTotal={(value) => updateDraftFields({ total: value.trim() === "" ? null : Number(value) })}
                onUpdateLineItem={updateLineItem}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
