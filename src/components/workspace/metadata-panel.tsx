interface MetadataPanelProps {
  title: string;
  slug: string;
  createdAt?: string;
}

export function MetadataPanel({ title, slug, createdAt }: MetadataPanelProps) {
  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString("en-CA")
    : new Date().toLocaleDateString("en-CA");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-bold text-text-primary tracking-tight">
        {title}
      </h1>
      <span className="text-xs text-text-muted">
        {dateStr} &middot; {slug}
      </span>
    </div>
  );
}
