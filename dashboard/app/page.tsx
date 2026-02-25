import { Suspense } from 'react';
import { PulseRow } from '@/components/PulseRow';
import { DateRangePicker } from '@/components/DateRangePicker';
import { SectionHeader } from '@/components/SectionHeader';
import { SignupChart } from '@/components/SignupChart';
import { RetentionCohort } from '@/components/RetentionCohort';
import { ActivationMetrics } from '@/components/ActivationMetrics';
import { SessionDepthChart } from '@/components/SessionDepthChart';
import { EngagementHeatmap } from '@/components/EngagementHeatmap';
import { ScreenTimeTable } from '@/components/ScreenTimeTable';
import { PowerUsersTable } from '@/components/PowerUsersTable';
import { ChurnRiskTable } from '@/components/ChurnRiskTable';
import { ContentLeaderboard } from '@/components/ContentLeaderboard';
import { SearchTerms } from '@/components/SearchTerms';
import { CommunityHealth } from '@/components/CommunityHealth';
import { GeoDemandTable } from '@/components/GeoDemandTable';
import { FunnelChart } from '@/components/FunnelChart';
import {
  getSignupsOverTime,
  getRetentionCohort,
  getStickiness,
  getActivationRate,
  getSignupToValueTime,
  getResurrectionRate,
} from '@/lib/queries/growth';
import {
  getSessionDepthDistribution,
  getContentEngagementHeatmap,
  getScreenTimeBreakdown,
  getPowerUsers,
  getChurnRiskUsers,
} from '@/lib/queries/engagement';
import {
  getTopContent,
  getSearchTerms,
  getCommunityHealth,
  getGeoDemand,
} from '@/lib/queries/content';
import {
  getFunnelData,
  DISCOVERY_FUNNEL,
  COMMUNITY_FUNNEL,
  TRIP_FUNNEL,
} from '@/lib/queries/funnels';
import { getSaveThroughRate } from '@/lib/queries/engagement';

export const revalidate = 300;

function parseDays(range: string): number {
  switch (range) {
    case 'today':
      return 1;
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case 'all':
      return 365;
    default:
      return 7;
  }
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function Dashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const days = parseDays(params.range ?? '7d');

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sola Analytics
          </h1>
          <p className="text-sola-textSecondary text-sm mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <Suspense>
          <DateRangePicker />
        </Suspense>
      </div>

      {/* Pulse */}
      <Suspense fallback={<CardGridSkeleton count={5} cols="lg:grid-cols-5" />}>
        <PulseRow />
      </Suspense>

      {/* Growth & Retention */}
      <SectionHeader
        title="Growth & Retention"
        subtitle="Are we growing and are people sticking around?"
      />
      <Suspense fallback={<ChartSkeleton />}>
        <GrowthChartSection days={days} />
      </Suspense>
      <div className="mt-6">
        <Suspense
          fallback={<CardGridSkeleton count={4} cols="md:grid-cols-4" />}
        >
          <ActivationSection days={days} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<ChartSkeleton height={200} />}>
          <RetentionSection />
        </Suspense>
      </div>

      {/* Engagement Depth */}
      <SectionHeader
        title="Engagement Depth"
        subtitle="How deeply are users engaging with the app?"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton height={240} />}>
          <SessionDepthSection days={days} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height={240} />}>
          <HeatmapSection days={days} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<ChartSkeleton height={300} />}>
          <ScreenTimeSection days={days} />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Suspense fallback={<ChartSkeleton height={200} />}>
          <PowerUsersSection days={days} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height={200} />}>
          <ChurnRiskSection />
        </Suspense>
      </div>

      {/* Content Intelligence */}
      <SectionHeader
        title="Content Intelligence"
        subtitle="Which content is driving engagement?"
      />
      <Suspense fallback={<ChartSkeleton height={400} />}>
        <ContentLeaderboardSection days={days} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Suspense fallback={<ChartSkeleton height={200} />}>
          <SearchTermsSection days={days} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height={200} />}>
          <CommunityHealthSection days={days} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<ChartSkeleton height={300} />}>
          <GeoDemandSection days={days} />
        </Suspense>
      </div>

      {/* Save-Through Rate */}
      <div className="mt-6">
        <Suspense fallback={<ChartSkeleton height={300} />}>
          <SaveThroughSection days={days} />
        </Suspense>
      </div>

      {/* Funnels */}
      <SectionHeader
        title="Funnels & Drop-off"
        subtitle="Where exactly are users dropping off?"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton height={250} />}>
          <DiscoveryFunnelSection days={days} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height={250} />}>
          <TripFunnelSection days={days} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height={250} />}>
          <CommunityFunnelSection days={days} />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="mt-16 mb-8 text-center">
        <p className="text-xs text-sola-textSecondary">
          Sola Analytics Dashboard — Data refreshes every 5 minutes
        </p>
      </div>
    </main>
  );
}

/* ---------- Async data sections ---------- */

async function GrowthChartSection({ days }: { days: number }) {
  const signups = await getSignupsOverTime(days);
  return <SignupChart data={signups} />;
}

async function ActivationSection({ days }: { days: number }) {
  const [activation, stickiness, timeToValue, resurrection] =
    await Promise.all([
      getActivationRate(days),
      getStickiness(),
      getSignupToValueTime(),
      getResurrectionRate(),
    ]);

  return (
    <ActivationMetrics
      activationRate={activation.rate}
      activated={activation.activated}
      total={activation.total}
      resurrectionCount={resurrection.count}
      medianMinutes={timeToValue.medianMinutes}
      sampleSize={timeToValue.sampleSize}
      stickiness={stickiness}
    />
  );
}

async function RetentionSection() {
  const cohort = await getRetentionCohort();
  return <RetentionCohort data={cohort} />;
}

async function SessionDepthSection({ days }: { days: number }) {
  const data = await getSessionDepthDistribution(days);
  return <SessionDepthChart data={data} />;
}

async function HeatmapSection({ days }: { days: number }) {
  const data = await getContentEngagementHeatmap(days);
  return <EngagementHeatmap data={data} />;
}

async function ScreenTimeSection({ days }: { days: number }) {
  const data = await getScreenTimeBreakdown(days);
  return <ScreenTimeTable data={data} />;
}

async function PowerUsersSection({ days }: { days: number }) {
  const data = await getPowerUsers(days);
  return <PowerUsersTable data={data} />;
}

async function ChurnRiskSection() {
  const data = await getChurnRiskUsers();
  return <ChurnRiskTable data={data} />;
}

async function ContentLeaderboardSection({ days }: { days: number }) {
  const [countries, cities, places, collections, threads] = await Promise.all([
    getTopContent('country', days),
    getTopContent('city', days),
    getTopContent('place', days),
    getTopContent('collection', days),
    getTopContent('thread', days),
  ]);

  return (
    <ContentLeaderboard
      data={{ country: countries, city: cities, place: places, collection: collections, thread: threads }}
    />
  );
}

async function SearchTermsSection({ days }: { days: number }) {
  const data = await getSearchTerms(days);
  return <SearchTerms data={data} />;
}

async function CommunityHealthSection({ days }: { days: number }) {
  const data = await getCommunityHealth(days);
  return <CommunityHealth data={data} />;
}

async function GeoDemandSection({ days }: { days: number }) {
  const data = await getGeoDemand(days);
  return <GeoDemandTable data={data} />;
}

async function SaveThroughSection({ days }: { days: number }) {
  const data = await getSaveThroughRate(days);
  if (data.length === 0) return null;

  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
        Save-Through Rate (Top Places)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-sola-textSecondary">
              <th className="pb-2 font-medium">Place</th>
              <th className="pb-2 font-medium text-right">Views</th>
              <th className="pb-2 font-medium text-right">Saves</th>
              <th className="pb-2 font-medium text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name} className="border-t border-sola-border">
                <td className="py-2 font-medium truncate max-w-[200px]">
                  {row.name}
                </td>
                <td className="py-2 text-right text-sola-textSecondary">
                  {row.views}
                </td>
                <td className="py-2 text-right text-sola-textSecondary">
                  {row.saves}
                </td>
                <td className="py-2 text-right font-medium">
                  <span
                    style={{
                      color:
                        row.rate >= 20
                          ? '#22C55E'
                          : row.rate >= 10
                            ? '#E5653A'
                            : '#EF4444',
                    }}
                  >
                    {row.rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function DiscoveryFunnelSection({ days }: { days: number }) {
  const data = await getFunnelData(DISCOVERY_FUNNEL, days);
  return <FunnelChart title="Discovery → Action" data={data} />;
}

async function TripFunnelSection({ days }: { days: number }) {
  const data = await getFunnelData(TRIP_FUNNEL, days);
  return <FunnelChart title="Trip Planning" data={data} />;
}

async function CommunityFunnelSection({ days }: { days: number }) {
  const data = await getFunnelData(COMMUNITY_FUNNEL, days);
  return <FunnelChart title="Community Participation" data={data} />;
}

/* ---------- Skeleton fallbacks ---------- */

function CardGridSkeleton({
  count,
  cols,
}: {
  count: number;
  cols: string;
}) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 ${cols} gap-4 mb-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-sola-card border border-sola-border rounded-xl p-5 animate-pulse"
        >
          <div className="h-3 w-20 bg-sola-border rounded mb-3" />
          <div className="h-8 w-16 bg-sola-border rounded" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5 animate-pulse">
      <div className="h-3 w-32 bg-sola-border rounded mb-4" />
      <div
        className="bg-sola-border/30 rounded"
        style={{ height }}
      />
    </div>
  );
}
