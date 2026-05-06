export function AppHeader() {
  return (
    <header className="mb-10 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Take-home assignment</p>
        <h1 className="m-0 text-4xl font-semibold tracking-tight xl:text-5xl">Receipt Parser</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 xl:text-base">
          Lean workflow: upload, inspect confidence, correct the fields that matter, and save locally.
        </p>
      </div>
    </header>
  );
}
