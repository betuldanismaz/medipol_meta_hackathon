type DemoDataBadgeProps = {
  isMock: boolean;
};

export default function DemoDataBadge({ isMock }: DemoDataBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100">
      <span className="h-2 w-2 rounded-full bg-amber-300" />
      {isMock ? "Mock social data aktif" : "Gercek API modu aktif"}
    </div>
  );
}
