type DemoDataBadgeProps = {
  isMock: boolean;
};

export default function DemoDataBadge({ isMock }: DemoDataBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
      <span
        className={`h-2 w-2 rounded-full ${isMock ? "bg-[var(--brand-3)]" : "bg-emerald-500"}`}
      />
      {isMock ? "Demo veri" : "API bağlı"}
    </div>
  );
}
