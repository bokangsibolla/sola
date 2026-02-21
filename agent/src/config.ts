import 'dotenv/config';

export interface AgentConfig {
  period: 'daily' | 'weekly';
  fetchOnly: boolean;
  maxArticlesDaily: number;
  maxArticlesWeekly: number;
  maxAgeDays: number;
  recipients: string[];
  minRelevanceScore: number;
}

export function loadConfig(): AgentConfig {
  const args = process.argv.slice(2);
  const periodFlag = args.find(a => a.startsWith('--period='))?.split('=')[1]
    || (args.includes('--period') ? args[args.indexOf('--period') + 1] : undefined);
  const isWeekly = periodFlag === 'weekly' || (new Date().getDay() === 1 && !periodFlag);

  return {
    period: isWeekly ? 'weekly' : 'daily',
    fetchOnly: args.includes('--fetch-only'),
    maxArticlesDaily: 5,
    maxArticlesWeekly: 7,
    maxAgeDays: isWeekly ? 7 : 2,
    recipients: (process.env.DIGEST_RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean),
    minRelevanceScore: 0.25,
  };
}
