const BASE = 'https://us.i.posthog.com';

export async function posthogQuery(query: string): Promise<unknown[] | null> {
  if (!process.env.POSTHOG_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
    return null;
  }

  try {
    const res = await fetch(
      `${BASE}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
        next: { revalidate: 300 }, // 5 min cache
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.results;
  } catch {
    return null;
  }
}
