import { badgeClasses, ConfidenceLevel, ReceiptItem } from "../receipt";

type LineItemsTableProps = {
  items: ReceiptItem[];
  confidence: ConfidenceLevel;
  onUpdateItem: (index: number, updates: Partial<Pick<ReceiptItem, "name" | "amount">>) => void;
};

export function LineItemsTable({ items, confidence, onUpdateItem }: LineItemsTableProps) {
  return (
    <section className="rounded-2xl border border-stone-200">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div>
          <h3 className="m-0 text-lg font-semibold">Line items</h3>
          <p className="mb-0 mt-1 text-sm text-stone-500">Keep editing inline. No separate edit mode needed.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses(confidence)}`}>
          {confidence} confidence
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-stone-50 text-left text-sm text-stone-600">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-t border-stone-200">
                <td className="px-4 py-3">
                  <input
                    value={item.name}
                    onChange={(event) => onUpdateItem(index, { name: event.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    value={item.amount?.toString() ?? ""}
                    onChange={(event) => onUpdateItem(index, { amount: event.target.value.trim() === "" ? null : Number(event.target.value) })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses(item.confidence)}`}>{item.confidence}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
