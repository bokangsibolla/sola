import {
  getTotalUsers,
  getDAU,
  getWAU,
  getNewSignupsToday,
  getEventsToday,
} from '@/lib/queries/pulse';
import { MetricCard } from './MetricCard';

function calcChange(current: number, previous: number): number | undefined {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export async function PulseRow() {
  const [users, dau, wau, signups, events] = await Promise.all([
    getTotalUsers(),
    getDAU(),
    getWAU(),
    getNewSignupsToday(),
    getEventsToday(),
  ]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <MetricCard
        label="Total Users"
        value={users.value}
        change={calcChange(users.value, users.previousValue)}
      />
      <MetricCard
        label="Active Today"
        value={dau.value}
        change={calcChange(dau.value, dau.previousValue)}
      />
      <MetricCard
        label="Active This Week"
        value={wau.value}
        change={calcChange(wau.value, wau.previousValue)}
      />
      <MetricCard
        label="New Signups"
        value={signups.value}
        change={calcChange(signups.value, signups.previousValue)}
      />
      <MetricCard
        label="Events Today"
        value={events.value}
        change={calcChange(events.value, events.previousValue)}
      />
    </div>
  );
}
