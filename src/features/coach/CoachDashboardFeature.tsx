// ========================================
// WELLIO HEALTH - COACH DASHBOARD FEATURE
// ONE-FILE MODULE (OVERVIEW + DETAIL)
// ========================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { VideoSessionsPanel } from "@/features/pro";

export interface CoachClientSummary {
  clientId: string;
  clientName: string | null;
  lastScore: number | null;
  avg7: number | null;
  trend: "up" | "down" | "flat" | "unknown";
  streakDays: number;
  needsAttention: boolean;
}

export interface CoachClientDetail {
  clientId: string;
  clientName: string | null;
  scores: { date: string; score: number }[];
  avgWorkout: number;
  avgMeals: number;
  avgHydration: number;
  avgSleep: number;
  avgMood: number;
}

interface DailyScoreRow {
  user_id: string;
  date: string;
  score: number | null;
  workout_completion: number | null;
  meals_completion: number | null;
  hydration_completion: number | null;
  mood_score: number | null;
  sleep_completion: number | null;
}

interface CoachClientRow {
  client_id: string;
  status: string;
  profiles: { full_name: string | null } | null;
}

// ---------- HOOK: FETCH COACH CLIENT LIST ----

function useCoachClients() {
  return useQuery({
    queryKey: ["coachClients"],
    queryFn: async (): Promise<CoachClientSummary[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1) Which clients are mapped to this coach?
      const { data: relationships, error: relError } = await supabase
        .from("coach_clients" as any)
        .select("client_id, status, profiles!coach_clients_client_id_fkey(full_name)")
        .eq("coach_id", user.id)
        .eq("status", "active");

      if (relError) throw relError;

      const typedRelationships = relationships as unknown as CoachClientRow[] | null;
      
      const clients =
        typedRelationships?.map((r) => ({
          id: r.client_id,
          name: r.profiles?.full_name ?? null,
        })) ?? [];

      if (clients.length === 0) return [];

      const clientIds = clients.map((c) => c.id);

      // 2) Pull last 7 days from daily_scores for all these clients
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 6);

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      const { data: scores, error: scoresError } = await supabase
        .from("daily_scores" as any)
        .select("user_id, date, score, workout_completion, meals_completion, hydration_completion, mood_score, sleep_completion")
        .in("user_id", clientIds)
        .gte("date", fromStr)
        .lte("date", toStr);

      if (scoresError) throw scoresError;

      const typedScores = scores as unknown as DailyScoreRow[] | null;

      const byClient = new Map<string, CoachClientSummary>();

      for (const c of clients) {
        const clientScores = typedScores?.filter((s) => s.user_id === c.id) ?? [];
        if (clientScores.length === 0) {
          byClient.set(c.id, {
            clientId: c.id,
            clientName: c.name,
            lastScore: null,
            avg7: null,
            trend: "unknown",
            streakDays: 0,
            needsAttention: false,
          });
          continue;
        }

        // sort by date ascending
        clientScores.sort((a, b) => (a.date < b.date ? -1 : 1));

        const last = clientScores[clientScores.length - 1];
        const lastScore = last.score ?? null;
        const avg7 =
          clientScores.reduce((sum, s) => sum + (s.score ?? 0), 0) /
          clientScores.length;

        let trend: CoachClientSummary["trend"] = "flat";
        if (clientScores.length >= 2) {
          const first = clientScores[0];
          if ((last.score ?? 0) > (first.score ?? 0)) trend = "up";
          else if ((last.score ?? 0) < (first.score ?? 0)) trend = "down";
          else trend = "flat";
        } else {
          trend = "unknown";
        }

        // simple streak heuristic: count consecutive days from end with score >= 60
        let streakDays = 0;
        for (let i = clientScores.length - 1; i >= 0; i--) {
          if ((clientScores[i].score ?? 0) >= 60) streakDays++;
          else break;
        }

        const needsAttention =
          lastScore !== null &&
          (lastScore < 50 || (trend === "down" && avg7 < 60));

        byClient.set(c.id, {
          clientId: c.id,
          clientName: c.name,
          lastScore,
          avg7: Math.round(avg7),
          trend,
          streakDays,
          needsAttention,
        });
      }

      return Array.from(byClient.values());
    },
  });
}

// ---------- HOOK: FETCH CLIENT DETAIL ------

function useCoachClientDetail(clientId: string | null) {
  return useQuery({
    queryKey: ["coachClientDetail", clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<CoachClientDetail> => {
      if (!clientId) throw new Error("No client selected");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1) verify relationship & get name
      const { data: rel, error: relError } = await supabase
        .from("coach_clients" as any)
        .select("profiles!coach_clients_client_id_fkey(full_name)")
        .eq("coach_id", user.id)
        .eq("client_id", clientId)
        .eq("status", "active")
        .maybeSingle();

      if (relError) throw relError;
      if (!rel) throw new Error("No active relationship with this client");

      const typedRel = rel as unknown as { profiles: { full_name: string | null } | null };
      const clientName = typedRel.profiles?.full_name ?? null;

      // 2) fetch last 30 days of daily_scores
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 29);

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      const { data: scores, error: scoresError } = await supabase
        .from("daily_scores" as any)
        .select("date, score, workout_completion, meals_completion, hydration_completion, mood_score, sleep_completion")
        .eq("user_id", clientId)
        .gte("date", fromStr)
        .lte("date", toStr);

      if (scoresError) throw scoresError;

      const typedScores = scores as unknown as DailyScoreRow[] | null;

      const sorted = (typedScores ?? []).sort((a, b) =>
        a.date < b.date ? -1 : 1
      );

      const history = sorted.map((s) => ({
        date: s.date,
        score: s.score ?? 0,
      }));

      const denom = Math.max(sorted.length, 1);

      const avgWorkout =
        sorted.reduce((sum, s) => sum + (s.workout_completion ?? 0), 0) /
        denom;
      const avgMeals =
        sorted.reduce((sum, s) => sum + (s.meals_completion ?? 0), 0) /
        denom;
      const avgHydration =
        sorted.reduce(
          (sum, s) => sum + (s.hydration_completion ?? 0),
          0
        ) / denom;
      const avgMood =
        sorted.reduce((sum, s) => sum + (s.mood_score ?? 0), 0) / denom;
      const avgSleep =
        sorted.reduce(
          (sum, s) => sum + (s.sleep_completion ?? 0),
          0
        ) / denom;

      return {
        clientId,
        clientName,
        scores: history,
        avgWorkout,
        avgMeals,
        avgHydration,
        avgMood,
        avgSleep,
      };
    },
  });
}

// ---------- UI: COACH DASHBOARD ------------

export function CoachDashboardScreen() {
  const { t } = useTranslation(['professional', 'common', 'live']);
  const { data, isLoading } = useCoachClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const selectedClient = useMemo(
    () => data?.find((c) => c.clientId === selectedClientId),
    [data, selectedClientId]
  );

  return (
    <div className="space-y-4">
      <VideoSessionsPanel />
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2 space-y-2">
        <h2 className="text-lg font-semibold">{t('professional:clients')}</h2>
        {isLoading && (
          <p className="text-sm text-muted-foreground">{t('professional:loading_clients')}</p>
        )}
        {!isLoading && (!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">
            {t('professional:no_active_clients')}
          </p>
        )}

        <div className="space-y-2">
          {data?.map((client) => (
            <button
              key={client.clientId}
              type="button"
              onClick={() => setSelectedClientId(client.clientId)}
              className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-accent/40 transition-colors ${
                selectedClientId === client.clientId ? "border-primary bg-accent/20" : "border-border"
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {client.clientName ?? t('professional:unnamed_client')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('professional:last_score')}:{" "}
                  {client.lastScore !== null
                    ? `${client.lastScore}/100`
                    : t('professional:no_data_yet')}
                  {" • "}
                  {t('professional:seven_day_avg')}:{" "}
                  {client.avg7 !== null ? `${client.avg7}/100` : "—"}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>
                  {t('professional:trend')}:{" "}
                  {client.trend === "up"
                    ? "↗"
                    : client.trend === "down"
                    ? "↘"
                    : client.trend === "flat"
                    ? "→"
                    : "?"}
                </p>
                <p>{t('professional:streak')}: {client.streakDays}d</p>
                {client.needsAttention && (
                  <p className="text-[11px] text-destructive mt-1">
                    {t('professional:needs_attention')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

        <div className="md:w-1/2 space-y-3">
          {selectedClient ? (
            <CoachClientDetailPanel client={selectedClient} />
          ) : (
            <p className="text-sm text-muted-foreground mt-6 md:mt-0">
              {t('professional:select_client')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CoachClientDetailPanel({ client }: { client: CoachClientSummary }) {
  const { t } = useTranslation(['professional']);
  const { data, isLoading } = useCoachClientDetail(client.clientId);

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{t('professional:loading_client_details')}</p>
      </div>
    );
  }

  const fmtPct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            {t('professional:client_overview')}
          </p>
          <p className="text-lg font-semibold">
            {data.clientName ?? t('professional:unnamed_client')}
          </p>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          <p>{t('professional:last_30_days')}</p>
        </div>
      </div>

      {/* Sparkline-style score history */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {t('professional:daily_score_trend')}
        </p>
        <div className="flex items-end gap-[2px] h-20 bg-muted/30 rounded-lg p-2">
          {data.scores.map((s) => {
            const height = Math.max((s.score / 100) * 100, 4);
            const color = s.score >= 70 ? 'bg-primary' : s.score >= 50 ? 'bg-yellow-500' : 'bg-destructive';
            return (
              <div
                key={s.date}
                className={`flex-1 ${color} rounded-t transition-all`}
                style={{ height: `${height}%` }}
                title={`${s.date}: ${s.score}`}
              />
            );
          })}
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label={t('professional:workout_adherence')} value={fmtPct(data.avgWorkout)} />
        <MetricCard label={t('professional:meals_logged')} value={fmtPct(data.avgMeals)} />
        <MetricCard label={t('professional:hydration')} value={fmtPct(data.avgHydration)} />
        <MetricCard label={t('professional:sleep_vs_goal')} value={fmtPct(data.avgSleep)} />
        <MetricCard label={t('professional:mood_energy')} value={fmtPct(data.avgMood)} />
      </div>

      {/* Placeholder for secure messaging (cMixx-ready) */}
      <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
        <p className="text-xs uppercase text-muted-foreground font-medium">
          {t('professional:secure_notes_cmix')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('professional:secure_notes_desc')}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 space-y-1">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

// ========================================
// END COACH DASHBOARD FEATURE
// ========================================
