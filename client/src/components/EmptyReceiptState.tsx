import { DragEvent, FormEvent, KeyboardEvent, RefObject } from "react";

type EmptyReceiptStateProps = {
  file: File | null;
  isDragging: boolean;
  isUploading: boolean;
  uploadInputRef: RefObject<HTMLInputElement>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFileChange: (file: File | null) => void;
  onOpenFilePicker: () => void;
  onUploadZoneKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
};

export function EmptyReceiptState({
  file,
  isDragging,
  isUploading,
  uploadInputRef,
  onSubmit,
  onFileChange,
  onOpenFilePicker,
  onUploadZoneKeyDown,
  onDragOver,
  onDragLeave,
  onDrop
}: EmptyReceiptStateProps) {
  return (
    <div className="empty-receipt-panel rounded-[28px] border border-dashed border-stone-300 p-8 text-center text-stone-500 sm:p-10 xl:p-14">
      <div className="mx-auto max-w-3xl">
        <p className="m-0 text-lg font-semibold text-stone-800 xl:text-2xl">Upload a receipt to start the review flow.</p>
        <p className="mb-0 mt-3 text-sm leading-6 text-stone-500 xl:text-base">
          PNG or JPG works best. Clear, uncropped photos give the model more reliable totals and line items.
        </p>
      </div>
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-2xl text-left">
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenFilePicker}
          onKeyDown={onUploadZoneKeyDown}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`cursor-pointer rounded-3xl border border-dashed px-5 py-5 transition xl:px-6 xl:py-6 ${
            isDragging
              ? "border-accent bg-amber-50 shadow-[0_0_0_4px_rgba(180,83,9,0.12)]"
              : "border-stone-300 bg-white hover:border-accent hover:bg-amber-50/70"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-sm font-medium text-stone-800 xl:text-base">
                {file ? "Receipt selected" : isDragging ? "Drop receipt image here" : "Choose a receipt image"}
              </span>
              <span className="mt-1 block truncate text-sm text-stone-500 xl:text-base">
                {file ? file.name : "Drag and drop a PNG or JPG, or click anywhere in this panel to browse."}
              </span>
            </div>
            <span className="shrink-0 rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-accent hover:text-accent xl:px-5 xl:py-2.5 xl:text-base">
              {isDragging ? "Drop now" : "Choose file"}
            </span>
          </div>
        </div>
        <input
          ref={uploadInputRef}
          id="receipt-upload"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
        <button
          type="submit"
          disabled={!file || isUploading}
          className="mt-5 w-full rounded-2xl bg-ink px-4 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 xl:text-base"
        >
          {isUploading ? "Parsing..." : "Upload and parse"}
        </button>
      </form>
    </div>
  );
}
