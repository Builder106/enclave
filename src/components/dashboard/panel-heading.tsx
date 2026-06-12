// Shared instrument-panel heading: mono numeric index + title over a hairline.
export function PanelHeading({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="border-b border-border/60 pb-3">
      <div className="flex items-baseline gap-2.5">
        <span className="eyebrow text-primary/65">{index}</span>
        <span className="eyebrow text-border">/</span>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {note ? <p className="mt-1.5 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
