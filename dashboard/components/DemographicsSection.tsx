import { MetricCard } from './MetricCard';
import {
  getNationalityBreakdown,
  getHomeCountryBreakdown,
  getAgeDistribution,
  getProfileCompletion,
  getLocaleBreakdown,
} from '@/lib/queries/demographics';

export async function DemographicsSection() {
  const [nationalities, countries, age, completion, locale] = await Promise.all(
    [
      getNationalityBreakdown(),
      getHomeCountryBreakdown(),
      getAgeDistribution(),
      getProfileCompletion(),
      getLocaleBreakdown(),
    ]
  );

  const completionRate =
    completion.total > 0
      ? Math.round((completion.hasOnboarded / completion.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Profile Completion Funnel */}
      <div className="bg-sola-card border border-sola-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
          Profile Completion Funnel
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Signed up', count: completion.total },
            { label: 'Added avatar', count: completion.hasAvatar },
            { label: 'Set home country', count: completion.hasCountry },
            { label: 'Set nationality', count: completion.hasNationality },
            { label: 'Added date of birth', count: completion.hasDob },
            { label: 'Selected interests', count: completion.hasInterests },
            { label: 'Set travel style', count: completion.hasTravelStyle },
            { label: 'Completed onboarding', count: completion.hasOnboarded },
            { label: 'Verified identity', count: completion.hasVerified },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-xs font-medium w-40 shrink-0">
                {step.label}
              </span>
              <div className="flex-1 h-6 bg-sola-bg rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md"
                  style={{
                    width: `${completion.total > 0 ? Math.max((step.count / completion.total) * 100, 2) : 0}%`,
                    backgroundColor: '#E5653A',
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-xs text-sola-textSecondary w-20 text-right shrink-0">
                {step.count}/{completion.total} (
                {completion.total > 0
                  ? Math.round((step.count / completion.total) * 100)
                  : 0}
                %)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nationality */}
        <div className="bg-sola-card border border-sola-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
            Nationality
          </h3>
          {nationalities.length === 0 ? (
            <p className="text-sola-textSecondary text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {nationalities.map((item) => (
                <div
                  key={item.nationality}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`text-sm ${item.nationality === 'Not set' ? 'text-sola-textSecondary italic' : 'font-medium'}`}
                  >
                    {item.nationality}
                  </span>
                  <span className="text-xs text-sola-textSecondary">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Home Country */}
        <div className="bg-sola-card border border-sola-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
            Home Country
          </h3>
          {countries.length === 0 ? (
            <p className="text-sola-textSecondary text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {countries.map((item) => (
                <div
                  key={item.country}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`text-sm ${item.country === 'Not set' ? 'text-sola-textSecondary italic' : 'font-medium'}`}
                  >
                    {item.country}
                  </span>
                  <span className="text-xs text-sola-textSecondary">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Age + Locale */}
        <div className="space-y-6">
          {/* Age */}
          <div className="bg-sola-card border border-sola-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
              Age Distribution
            </h3>
            {age.buckets.length === 0 ? (
              <div>
                <p className="text-sola-textSecondary text-sm">
                  {age.coverage === 0
                    ? 'No users have set their date of birth yet'
                    : 'No valid age data'}
                </p>
                <p className="text-xs text-sola-textSecondary mt-1">
                  {age.coverage}% of users have DOB set
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {age.buckets.map((bucket) => (
                  <div
                    key={bucket.range}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{bucket.range}</span>
                    <span className="text-xs text-sola-textSecondary">
                      {bucket.count} ({bucket.percentage}%)
                    </span>
                  </div>
                ))}
                {age.medianAge && (
                  <p className="text-xs text-sola-textSecondary mt-2 pt-2 border-t border-sola-border">
                    Median age: {age.medianAge} | {age.coverage}% have DOB set
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Currency & Language */}
          <div className="bg-sola-card border border-sola-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-sola-textSecondary mb-4">
              Language & Currency
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-sola-textSecondary mb-1">
                  Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {locale.languages.map((l) => (
                    <span
                      key={l.code}
                      className="inline-flex items-center gap-1 text-xs bg-sola-bg rounded-full px-2.5 py-1 font-medium"
                    >
                      {l.code.toUpperCase()}
                      <span className="text-sola-textSecondary">{l.count}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-sola-textSecondary mb-1">
                  Currencies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {locale.currencies.map((c) => (
                    <span
                      key={c.code}
                      className="inline-flex items-center gap-1 text-xs bg-sola-bg rounded-full px-2.5 py-1 font-medium"
                    >
                      {c.code.toUpperCase()}
                      <span className="text-sola-textSecondary">{c.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Onboarding Rate"
          value={completionRate}
          suffix="%"
        />
        <MetricCard
          label="Profile Photo"
          value={
            completion.total > 0
              ? Math.round((completion.hasAvatar / completion.total) * 100)
              : 0
          }
          suffix="%"
        />
        <MetricCard
          label="DOB Coverage"
          value={age.coverage}
          suffix="%"
        />
        <MetricCard
          label="Verified"
          value={completion.hasVerified}
          suffix={`/ ${completion.total}`}
        />
      </div>
    </div>
  );
}
