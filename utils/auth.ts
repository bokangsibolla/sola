// Helper to get auth user data for prefilling
// When Supabase is integrated, replace this with actual Supabase auth calls

export interface AuthUserData {
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
}

export async function getAuthUserData(): Promise<AuthUserData> {
  // TODO: Replace with actual Supabase auth when integrated
  // Example:
  // const { data: { user } } = await supabase.auth.getUser();
  // return {
  //   name: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
  //   avatarUrl: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
  //   email: user?.email || null,
  // };
  
  return {
    name: null,
    avatarUrl: null,
    email: null,
  };
}

export function generateUsernameFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
}
