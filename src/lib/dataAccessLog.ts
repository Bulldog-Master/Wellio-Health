import { supabase } from "@/integrations/supabase/client";

export type AccessRole = "supporter" | "coach" | "clinician";
export type AccessType =
  | "fwi"
  | "trends"
  | "adherence"
  | "summary"
  | "messaging_metadata_free_view"
  | "profile_view"
  | "dashboard_view";

interface LogAccessOptions {
  subjectId: string;
  role: AccessRole;
  accessType: AccessType;
  context?: Record<string, unknown>;
}

/**
 * Fire-and-forget logging helper.
 * Used after a successful derived-data fetch.
 * Non-blocking - errors are silently ignored to avoid impacting UX.
 */
export async function logDataAccess(opts: LogAccessOptions): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    // Use supabase.functions.invoke for proper URL handling
    await supabase.functions.invoke('log-data-access', {
      body: {
        clientId: opts.subjectId,
        role: opts.role,
        accessType: opts.accessType,
        context: opts.context,
      },
    });
  } catch {
    // Non-fatal; do not impact UX
    console.debug('[dataAccessLog] Failed to log access (non-fatal)');
  }
}

/**
 * Wrap any data fetch with automatic access logging.
 * Usage:
 * ```ts
 * const data = await withLoggedAccess(
 *   () => supabase.from('daily_scores').select('*').eq('user_id', subjectId),
 *   { subjectId, role: 'coach', accessType: 'fwi' }
 * );
 * ```
 */
export async function withLoggedAccess<T>(
  fetchFn: () => Promise<{ data: T; error: Error | null }>,
  logOptions: LogAccessOptions
): Promise<T> {
  const { data, error } = await fetchFn();
  
  if (error) throw error;
  
  // Fire-and-forget logging after successful fetch
  logDataAccess(logOptions);
  
  return data;
}

/**
 * Example: Fetch FWI data for professional view with automatic logging
 */
export async function fetchFwiForProfessionalView(
  subjectId: string, 
  role: AccessRole = 'coach'
) {
  // 1. Fetch derived FWI data (latest daily score)
  const { data, error } = await supabase
    .from("daily_scores")
    .select("score, date, workout_completion, meals_completion, hydration_completion, mood_score, sleep_completion")
    .eq("user_id", subjectId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // 2. Log data access (fire-and-forget)
  logDataAccess({
    subjectId,
    role,
    accessType: "fwi",
    context: { view: `${role}_dashboard` },
  });

  return data;
}

/**
 * Fetch trends data for professional view with automatic logging
 */
export async function fetchTrendsForProfessionalView(
  subjectId: string,
  role: AccessRole = 'coach',
  days: number = 14
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from("daily_scores")
    .select("score, date, workout_completion, meals_completion, hydration_completion, mood_score, sleep_completion")
    .eq("user_id", subjectId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;

  logDataAccess({
    subjectId,
    role,
    accessType: "trends",
    context: { view: `${role}_dashboard`, days },
  });

  return data;
}

/**
 * Fetch adherence breakdown for professional view with automatic logging
 */
export async function fetchAdherenceForProfessionalView(
  subjectId: string,
  role: AccessRole = 'coach',
  days: number = 7
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from("daily_scores")
    .select("workout_completion, meals_completion, hydration_completion, sleep_completion, date")
    .eq("user_id", subjectId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;

  logDataAccess({
    subjectId,
    role,
    accessType: "adherence",
    context: { view: `${role}_dashboard`, days },
  });

  return data;
}
