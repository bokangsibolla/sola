interface Props {
  data: {
    userId: string;
    name: string;
    lastEvent: string;
    lastScreen: string;
    totalEventsLastWeek: number;
  }[];
}

function formatLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function ChurnRiskTable({ data }: Props) {
  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Churn Risk
      </h3>
      {data.length === 0 ? (
        <p className="text-sola-textSecondary text-sm">
          No at-risk users detected
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-sola-textSecondary">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Last Seen</th>
                <th className="pb-2 font-medium">Last Screen</th>
                <th className="pb-2 font-medium text-right">Events</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr
                  key={user.userId}
                  className="border-t border-sola-border"
                >
                  <td className="py-2 font-medium">{user.name}</td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sola-red" />
                      <span className="text-sola-textSecondary">
                        {timeAgo(user.lastEvent)}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 text-sola-textSecondary">
                    {formatLabel(user.lastScreen)}
                  </td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {user.totalEventsLastWeek}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
