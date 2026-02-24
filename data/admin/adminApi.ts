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

// ---------------------------------------------------------------------------
// Content Reports
// ---------------------------------------------------------------------------

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'thread' | 'reply';
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export async function getContentReports(): Promise<ContentReport[]> {
  const { data, error } = await supabase
    .from('content_reports')
    .select(`
      id, reporter_id, target_type, target_id, reason, details, status, created_at,
      profiles:reporter_id(first_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.profiles?.first_name ?? 'Unknown',
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function resolveContentReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
): Promise<void> {
  const { error } = await supabase
    .from('content_reports')
    .update({ status })
    .eq('id', reportId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// User Reports
// ---------------------------------------------------------------------------

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export async function getUserReports(): Promise<UserReport[]> {
  const { data, error } = await supabase
    .from('user_reports')
    .select(`
      id, reporter_id, reported_id, reason, details, status, created_at,
      reporter:reporter_id(first_name),
      reported:reported_id(first_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.reporter?.first_name ?? 'Unknown',
    reportedId: row.reported_id,
    reportedName: row.reported?.first_name ?? 'Unknown',
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function resolveUserReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
): Promise<void> {
  const { error } = await supabase
    .from('user_reports')
    .update({ status })
    .eq('id', reportId);

  if (error) throw error;
}
