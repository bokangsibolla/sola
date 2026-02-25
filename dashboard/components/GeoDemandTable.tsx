interface Props {
  data: {
    name: string;
    events: number;
    contentCount: number;
    demandRatio: number;
  }[];
}

export function GeoDemandTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          Geographic Demand
        </h3>
        <p className="text-sola-textSecondary text-sm">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Geographic Demand vs Content Supply
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-sola-textSecondary">
              <th className="pb-2 font-medium">Country</th>
              <th className="pb-2 font-medium text-right">Events</th>
              <th className="pb-2 font-medium text-right">Cities</th>
              <th className="pb-2 font-medium text-right">Demand Ratio</th>
              <th className="pb-2 font-medium text-right">Signal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isHighDemand =
                row.demandRatio > 10 && row.contentCount < 5;
              return (
                <tr key={row.name} className="border-t border-sola-border">
                  <td className="py-2 font-medium">{row.name}</td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {row.events.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-sola-textSecondary">
                    {row.contentCount}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {row.demandRatio}x
                  </td>
                  <td className="py-2 text-right">
                    {isHighDemand ? (
                      <span className="text-xs bg-sola-orangeLight text-sola-orange px-2 py-0.5 rounded-full font-medium">
                        Expand
                      </span>
                    ) : (
                      <span className="text-xs text-sola-textSecondary">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
