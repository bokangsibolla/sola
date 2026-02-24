import { supabase } from '@/lib/supabase';

export interface AdminPendingCounts {
  verifications: number;
  contentReports: number;
  userReports: number;
  total: number;
}

export async function getAdminPendingCounts(): Promise<AdminPendingCounts> {
  const [vResult, crResult, urResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('content_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('user_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const verifications = vResult.count ?? 0;
  const contentReports = crResult.count ?? 0;
  const userReports = urResult.count ?? 0;

  return {
    verifications,
    contentReports,
    userReports,
    total: verifications + contentReports + userReports,
  };
}
