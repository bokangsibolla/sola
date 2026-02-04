import { supabase } from './seed-utils';

function toCamel<T>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out as T;
}

async function main() {
  const testSlugs = ['bangkok', 'chiang-mai', 'ubud', 'lisbon', 'invalid-slug', ''];

  for (const slug of testSlugs) {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.log(`"${slug}": ERROR - ${error.message}`);
    } else if (data) {
      const city = toCamel<any>(data);
      console.log(`"${slug}": FOUND - ${city.name} (id: ${city.id})`);
    } else {
      console.log(`"${slug}": NOT FOUND`);
    }
  }
}

main();
