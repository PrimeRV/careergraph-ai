/* app/components/HighlightText.tsx */
"use client";

type HighlightTextProps = {
  text?: string | number | null;
  query?: string;
  className?: string;
};

export default function HighlightText({
  text,
  query = "",
  className = "",
}: HighlightTextProps) {
  const value = String(text ?? "");
  const search = query.trim();

  if (!search) {
    return <span className={className}>{value}</span>;
  }

  const escapedQuery = search.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const parts = value.split(
    new RegExp(`(${escapedQuery})`, "gi")
  );

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-violet-500/30 px-1 text-violet-200 ring-1 ring-violet-400/20"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
