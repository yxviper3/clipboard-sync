interface StatusPillProps {
  active?: boolean;
  label: string;
  value: string | number;
}

export default function StatusPill({ active = false, label, value }: StatusPillProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
        {active && <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />}
        {value}
      </div>
    </div>
  );
}
