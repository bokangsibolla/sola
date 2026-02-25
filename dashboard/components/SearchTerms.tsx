interface Props {
  data: { term: string; count: number }[];
}

export function SearchTerms({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          Search Terms
        </h3>
        <p className="text-sola-textSecondary text-sm">No searches yet</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        What People Search For
      </h3>
      <div className="flex flex-wrap gap-2">
        {data.map((item) => {
          const intensity = item.count / maxCount;
          const size =
            intensity > 0.7
              ? 'text-sm px-3 py-1.5'
              : intensity > 0.3
                ? 'text-xs px-2.5 py-1'
                : 'text-xs px-2 py-0.5';
          const opacity =
            intensity > 0.7 ? '1' : intensity > 0.3 ? '0.85' : '0.65';

          return (
            <span
              key={item.term}
              className={`inline-flex items-center gap-1.5 rounded-full bg-sola-orangeLight font-medium ${size}`}
              style={{ opacity }}
            >
              <span className="text-sola-text">{item.term}</span>
              <span className="text-sola-textSecondary">{item.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
