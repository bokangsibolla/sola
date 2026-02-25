interface Props {
  data: {
    userId: string;
    name: string;
    sessions: number;
    saves: number;
    communityActions: number;
    totalEvents: number;
  }[];
}

export function PowerUsersTable({ data }: Props) {
  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Power Users
      </h3>
      {data.length === 0 ? (
        <p className="text-sola-textSecondary text-sm">
          No power users yet (5+ sessions, 3+ saves, community activity)
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-sola-textSecondary">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium text-right">Sessions</th>
                <th className="pb-2 font-medium text-right">Saves</th>
                <th className="pb-2 font-medium text-right">Community</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr
                  key={user.userId}
                  className="border-t border-sola-border"
                >
                  <td className="py-2 font-medium">{user.name}</td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {user.sessions}
                  </td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {user.saves}
                  </td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {user.communityActions}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {user.totalEvents.toLocaleString()}
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
