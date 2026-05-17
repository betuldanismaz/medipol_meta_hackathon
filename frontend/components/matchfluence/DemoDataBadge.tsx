type DemoDataBadgeProps = {
  isMock: boolean;
};

export default function DemoDataBadge({ isMock }: DemoDataBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-indigo-500" />
      {isMock ? "Mock veri aktif" : "API modu aktif"}
    </div>
  );
}
