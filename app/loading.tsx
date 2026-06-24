export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-0 min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft px-10 py-12 flex flex-col items-center text-center gap-5 max-w-sm w-full">
        <div className="relative w-14 h-14">
          <span className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin" />
        </div>
        <div className="space-y-1">
          <strong className="block text-base font-extrabold text-slate-800 font-heading">
            Loading Family Day…
          </strong>
          <span className="block text-xs font-bold text-slate-400">
            Preparing your event workspace
          </span>
        </div>
      </div>
    </main>
  );
}
