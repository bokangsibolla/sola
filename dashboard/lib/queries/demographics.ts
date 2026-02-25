import { supabase } from '../supabase';

// 1. Nationality breakdown
export async function getNationalityBreakdown(): Promise<
  { nationality: string; count: number; percentage: number }[]
> {
  const { data } = await supabase
    .from('profiles')
    .select('nationality');

  if (!data?.length) return [];

  const total = data.length;
  const counts = new Map<string, number>();
  let unset = 0;

  data.forEach((p) => {
    const nat = p.nationality?.trim();
    if (nat) {
      counts.set(nat, (counts.get(nat) ?? 0) + 1);
    } else {
      unset++;
    }
  });

  const result = Array.from(counts.entries())
    .map(([nationality, count]) => ({
      nationality,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  if (unset > 0) {
    result.push({
      nationality: 'Not set',
      count: unset,
      percentage: Math.round((unset / total) * 100),
    });
  }

  return result;
}

// 2. Home country breakdown
export async function getHomeCountryBreakdown(): Promise<
  { country: string; count: number; percentage: number }[]
> {
  const { data } = await supabase
    .from('profiles')
    .select('home_country_name');

  if (!data?.length) return [];

  const total = data.length;
  const counts = new Map<string, number>();
  let unset = 0;

  data.forEach((p) => {
    const country = p.home_country_name?.trim();
    if (country) {
      counts.set(country, (counts.get(country) ?? 0) + 1);
    } else {
      unset++;
    }
  });

  const result = Array.from(counts.entries())
    .map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  if (unset > 0) {
    result.push({
      country: 'Not set',
      count: unset,
      percentage: Math.round((unset / total) * 100),
    });
  }

  return result;
}

// 3. Age distribution
export async function getAgeDistribution(): Promise<{
  buckets: { range: string; count: number; percentage: number }[];
  medianAge: number | null;
  coverage: number; // % of users who have DOB set
}> {
  const { data } = await supabase
    .from('profiles')
    .select('date_of_birth');

  if (!data?.length) return { buckets: [], medianAge: null, coverage: 0 };

  const total = data.length;
  const now = new Date();
  const ages: number[] = [];

  data.forEach((p) => {
    if (p.date_of_birth) {
      const dob = new Date(p.date_of_birth);
      const age = Math.floor(
        (now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age >= 13 && age <= 100) ages.push(age); // Filter out test/invalid data
    }
  });

  const coverage = Math.round((ages.length / total) * 100);

  if (ages.length === 0) return { buckets: [], medianAge: null, coverage };

  ages.sort((a, b) => a - b);
  const mid = Math.floor(ages.length / 2);
  const medianAge =
    ages.length % 2 !== 0 ? ages[mid] : Math.round((ages[mid - 1] + ages[mid]) / 2);

  const bucketDefs = [
    { range: '18-24', min: 18, max: 24 },
    { range: '25-34', min: 25, max: 34 },
    { range: '35-44', min: 35, max: 44 },
    { range: '45-54', min: 45, max: 54 },
    { range: '55+', min: 55, max: 200 },
  ];

  const buckets = bucketDefs.map(({ range, min, max }) => {
    const count = ages.filter((a) => a >= min && a <= max).length;
    return {
      range,
      count,
      percentage: ages.length > 0 ? Math.round((count / ages.length) * 100) : 0,
    };
  });

  return { buckets, medianAge, coverage };
}

// 4. Profile completion rates — how much of onboarding do people finish?
export async function getProfileCompletion(): Promise<{
  total: number;
  hasAvatar: number;
  hasCountry: number;
  hasNationality: number;
  hasDob: number;
  hasInterests: number;
  hasTravelStyle: number;
  hasOnboarded: number;
  hasVerified: number;
}> {
  const { data } = await supabase
    .from('profiles')
    .select(
      'avatar_url, home_country_name, nationality, date_of_birth, interests, travel_style, onboarding_completed_at, verification_status'
    );

  if (!data?.length)
    return {
      total: 0,
      hasAvatar: 0,
      hasCountry: 0,
      hasNationality: 0,
      hasDob: 0,
      hasInterests: 0,
      hasTravelStyle: 0,
      hasOnboarded: 0,
      hasVerified: 0,
    };

  return {
    total: data.length,
    hasAvatar: data.filter((p) => p.avatar_url).length,
    hasCountry: data.filter((p) => p.home_country_name).length,
    hasNationality: data.filter((p) => p.nationality).length,
    hasDob: data.filter((p) => p.date_of_birth).length,
    hasInterests: data.filter(
      (p) => p.interests && (p.interests as string[]).length > 0
    ).length,
    hasTravelStyle: data.filter((p) => p.travel_style).length,
    hasOnboarded: data.filter((p) => p.onboarding_completed_at).length,
    hasVerified: data.filter((p) => p.verification_status === 'verified').length,
  };
}

// 5. Language and currency breakdown
export async function getLocaleBreakdown(): Promise<{
  languages: { code: string; count: number }[];
  currencies: { code: string; count: number }[];
}> {
  const { data } = await supabase
    .from('profiles')
    .select('preferred_language, preferred_currency');

  if (!data?.length) return { languages: [], currencies: [] };

  const langs = new Map<string, number>();
  const currs = new Map<string, number>();

  data.forEach((p) => {
    const lang = p.preferred_language?.trim() || 'unknown';
    const curr = p.preferred_currency?.trim() || 'unknown';
    langs.set(lang, (langs.get(lang) ?? 0) + 1);
    currs.set(curr, (currs.get(curr) ?? 0) + 1);
  });

  return {
    languages: Array.from(langs.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count),
    currencies: Array.from(currs.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count),
  };
}
