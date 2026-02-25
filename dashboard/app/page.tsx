import { Suspense } from 'react';
import { PulseRow } from '@/components/PulseRow';
import { DateRangePicker } from '@/components/DateRangePicker';
import { SectionHeader } from '@/components/SectionHeader';
import { SignupChart } from '@/components/SignupChart';
import { RetentionCohort } from '@/components/RetentionCohort';
import { ActivationMetrics } from '@/components/ActivationMetrics';
import {
  getSignupsOverTime,
  getRetentionCohort,
  getStickiness,
  getActivationRate,
  getSignupToValueTime,
  getResurrectionRate,
} from '@/lib/queries/growth';

export const revalidate = 300; // 5 min cache

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

      <Suspense fallback={<PulseRowSkeleton />}>
        <PulseRow />
      </Suspense>

      <SectionHeader
        title="Growth & Retention"
        subtitle="Are we growing and are people sticking around?"
      />

      <Suspense fallback={<SignupChartSkeleton />}>
        <GrowthChartSection days={days} />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<ActivationSkeleton />}>
          <ActivationSection days={days} />
        </Suspense>
      </div>

      <div className="mt-6">
        <Suspense fallback={<RetentionSkeleton />}>
          <RetentionSection />
        </Suspense>
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

/* ---------- Skeleton fallbacks ---------- */

function PulseRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
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

function SignupChartSkeleton() {
  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5 animate-pulse">
      <div className="h-3 w-32 bg-sola-border rounded mb-4" />
      <div className="h-[280px] bg-sola-border/30 rounded" />
    </div>
  );
}

function ActivationSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

function RetentionSkeleton() {
  return (
    <div className="bg-sola-card border border-sola-border rounded-xl p-5 animate-pulse">
      <div className="h-3 w-32 bg-sola-border rounded mb-4" />
      <div className="h-[200px] bg-sola-border/30 rounded" />
    </div>
  );
}
