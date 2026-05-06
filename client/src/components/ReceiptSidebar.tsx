import { Receipt } from "../receipt";

type ReceiptSidebarProps = {
  receipts: Receipt[];
  activeReceiptId: string | null;
  onSelectReceipt: (receipt: Receipt) => void;
};

export function ReceiptSidebar({ receipts, activeReceiptId, onSelectReceipt }: ReceiptSidebarProps) {
  return (
    <aside className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm xl:min-h-[640px]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-lg font-semibold xl:text-xl">Saved receipts</h2>
        <span className="text-sm text-stone-500">{receipts.length}</span>
      </div>
      <div className="space-y-3">
        {receipts.map((receipt) => (
          <button
            key={receipt.id}
            type="button"
            onClick={() => onSelectReceipt(receipt)}
            className={`w-full rounded-2xl border p-3 text-left transition ${
              receipt.id === activeReceiptId ? "border-accent bg-amber-50" : "border-stone-200 bg-stone-50 hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 truncate text-sm font-medium">{receipt.parsed.fields.merchantName || receipt.imageName}</p>
              <span className="rounded-full bg-stone-200 px-2 py-1 text-[11px] uppercase tracking-wide text-stone-700">{receipt.status}</span>
            </div>
            <p className="mb-0 mt-1 text-xs text-stone-500">{new Date(receipt.updatedAt).toLocaleString()}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
