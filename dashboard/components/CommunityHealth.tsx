import { MetricCard } from './MetricCard';

interface Props {
  data: {
    postsPerDay: number;
    avgRepliesPerThread: number;
    medianTimeToFirstReply: number | null;
    ghostThreadRate: number;
    totalThreads: number;
    totalReplies: number;
  };
}

export function CommunityHealth({ data }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Posts / Day" value={data.postsPerDay} />
        <MetricCard label="Avg Replies" value={data.avgRepliesPerThread} />
        <MetricCard
          label="Time to Reply"
          value={data.medianTimeToFirstReply ?? '—'}
          suffix={data.medianTimeToFirstReply !== null ? 'min' : undefined}
        />
        <MetricCard
          label="Ghost Threads"
          value={data.ghostThreadRate}
          suffix="%"
          change={data.ghostThreadRate > 30 ? -data.ghostThreadRate : undefined}
        />
      </div>
      <p className="text-xs text-sola-textSecondary mt-3 px-1">
        {data.totalThreads} threads, {data.totalReplies} replies total
      </p>
    </div>
  );
}
