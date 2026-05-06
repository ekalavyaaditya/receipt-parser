import { badgeClasses, ConfidenceLevel } from "../receipt";

type FieldCardProps = {
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  onChange: (value: string) => void;
};

export function FieldCard({ label, value, confidence, onChange }: FieldCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses(confidence)}`}>{confidence}</span>
      </div>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2" />
    </div>
  );
}
