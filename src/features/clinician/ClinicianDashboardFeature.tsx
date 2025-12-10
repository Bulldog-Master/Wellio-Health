// ========================================
// WELLIO HEALTH - CLINICIAN DASHBOARD FEATURE
// Functional trend view for physicians/clinicians
// Reuses daily_scores, no PHI exposed
// ========================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";

// ---------- TYPES ------------------------

export interface ClinicianPatientSummary {
  patientId: string;
  patientName: string | null;
  lastIndex: number | null;   // last functional wellness index
  avg14: number | null;       // 14-day average
  trend14: "improving" | "declining" | "stable" | "unknown";
  adherenceScore: number | null; // 0-100, derived from behavior components
  riskFlag: "none" | "watch" | "alert";
}

export interface ClinicianPatientDetail {
  patientId: string;
  patientName: string | null;
  indices: { date: string; value: number }[];
  avgWorkout: number;
  avgMeals: number;
  avgHydration: number;
  avgSleep: number;
  avgMood: number;
  riskNarrative: string;
}

// ---------- HELPER: USER HOOK ------------

function useCurrentUser() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id } : null);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

// ---------- HELPER: RISK EVAL ------------

function evaluateRiskFlag(opts: {
  lastIndex: number | null;
  avg14: number | null;
  trend14: ClinicianPatientSummary["trend14"];
}): "none" | "watch" | "alert" {
  const { lastIndex, avg14, trend14 } = opts;

  if (lastIndex === null || avg14 === null) return "none";

  // Example thresholds – you can tune these
  if (lastIndex < 40 && trend14 === "declining") return "alert";
  if (lastIndex < 50 || (trend14 === "declining" && avg14 < 60)) return "watch";
  return "none";
}

function describeTrend(trend: ClinicianPatientSummary["trend14"]) {
  switch (trend) {
    case "improving":
      return "Functional index has been improving over the last 14 days.";
    case "declining":
      return "Functional index has been declining over the last 14 days.";
    case "stable":
      return "Functional index has remained relatively stable.";
    default:
      return "Insufficient data to determine a clear trend.";
  }
}

// ---------- HOOK: PATIENT LIST -----------

function useClinicianPatients() {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ["clinicianPatients", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ClinicianPatientSummary[]> => {
      if (!user?.id) return [];

      // 1) which patients are mapped to this clinician?
      // NOTE: clinician_patients table needs to be created via migration
      const { data: relationships, error: relError } = await (supabase
        .from("clinician_patients" as any)
        .select("patient_id, status, profiles!clinician_patients_patient_id_fkey(full_name)")
        .eq("clinician_id", user.id)
        .eq("status", "active") as any);

      if (relError) throw relError;

      const patients =
        relationships?.map((r: any) => ({
          id: r.patient_id as string,
          name: (r.profiles?.full_name as string) ?? null,
        })) ?? [];

      if (patients.length === 0) return [];

      const patientIds = patients.map((p) => p.id);

      // 2) pull last 14 days of daily_scores for all patients
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 13);

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      const { data: scores, error: scoresError } = await supabase
        .from("daily_scores")
        .select(
          "user_id, date, score, workout_completion, meals_completion, hydration_completion, mood_score, sleep_completion"
        )
        .in("user_id", patientIds)
        .gte("date", fromStr)
        .lte("date", toStr);

      if (scoresError) throw scoresError;

      const byPatient = new Map<string, ClinicianPatientSummary>();

      for (const p of patients) {
        const patientScores = scores?.filter((s) => s.user_id === p.id) ?? [];
        if (patientScores.length === 0) {
          byPatient.set(p.id, {
            patientId: p.id,
            patientName: p.name,
            lastIndex: null,
            avg14: null,
            trend14: "unknown",
            adherenceScore: null,
            riskFlag: "none",
          });
          continue;
        }

        // sort by date ascending
        patientScores.sort((a, b) => (a.date < b.date ? -1 : 1));
        const last = patientScores[patientScores.length - 1];
        const lastIndex = last.score ?? null;

        const avg14 =
          patientScores.reduce((sum, s) => sum + (s.score ?? 0), 0) /
          patientScores.length;

        let trend14: ClinicianPatientSummary["trend14"] = "stable";
        if (patientScores.length >= 2) {
          const first = patientScores[0];
          const delta = (last.score ?? 0) - (first.score ?? 0);
          if (delta > 5) trend14 = "improving";
          else if (delta < -5) trend14 = "declining";
          else trend14 = "stable";
        } else {
          trend14 = "unknown";
        }

        // adherenceScore: derived from behavioral components
        const denom = Math.max(patientScores.length, 1);
        const avgWorkout =
          patientScores.reduce(
            (sum, s) => sum + (s.workout_completion ?? 0),
            0
          ) / denom;
        const avgMeals =
          patientScores.reduce(
            (sum, s) => sum + (s.meals_completion ?? 0),
            0
          ) / denom;
        const avgHydration =
          patientScores.reduce(
            (sum, s) => sum + (s.hydration_completion ?? 0),
            0
          ) / denom;
        const avgSleep =
          patientScores.reduce(
            (sum, s) => sum + (s.sleep_completion ?? 0),
            0
          ) / denom;

        // simple adherence composite (0–100)
        const adherenceScore = Math.round(
          (avgWorkout * 0.4 +
            avgMeals * 0.25 +
            avgHydration * 0.2 +
            avgSleep * 0.15) *
            100
        );

        const riskFlag = evaluateRiskFlag({
          lastIndex,
          avg14,
          trend14,
        });

        byPatient.set(p.id, {
          patientId: p.id,
          patientName: p.name,
          lastIndex,
          avg14: Math.round(avg14),
          trend14,
          adherenceScore,
          riskFlag,
        });
      }

      return Array.from(byPatient.values());
    },
  });
}

// ---------- HOOK: PATIENT DETAIL ----------

function useClinicianPatientDetail(patientId: string) {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ["clinicianPatientDetail", user?.id, patientId],
    enabled: !!user?.id && !!patientId,
    queryFn: async (): Promise<ClinicianPatientDetail> => {
      if (!user?.id) throw new Error("Not authenticated");

      // 1) ensure clinician-patient relationship
      // NOTE: clinician_patients table needs to be created via migration
      const { data: rel, error: relError } = await (supabase
        .from("clinician_patients" as any)
        .select("profiles!clinician_patients_patient_id_fkey(full_name)")
        .eq("clinician_id", user.id)
        .eq("patient_id", patientId)
        .eq("status", "active")
        .maybeSingle() as any);

      if (relError) throw relError;
      if (!rel) throw new Error("No active relationship with this patient");

      const patientName = (rel as any).profiles?.full_name ?? null;

      // 2) fetch last 30 days of daily_scores
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 29);

      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      const { data: scores, error: scoresError } = await supabase
        .from("daily_scores")
        .select(
          "date, score, workout_completion, meals_completion, hydration_completion, mood_score, sleep_completion"
        )
        .eq("user_id", patientId)
        .gte("date", fromStr)
        .lte("date", toStr);

      if (scoresError) throw scoresError;

      const sorted = (scores ?? []).sort((a, b) =>
        a.date < b.date ? -1 : 1
      );

      const indices = sorted.map((s) => ({
        date: s.date,
        value: s.score,
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
      const avgSleep =
        sorted.reduce(
          (sum, s) => sum + (s.sleep_completion ?? 0),
          0
        ) / denom;
      const avgMood =
        sorted.reduce((sum, s) => sum + (s.mood_score ?? 0), 0) / denom;

      // simple narrative based on trend
      let trend14: ClinicianPatientSummary["trend14"] = "unknown";
      if (sorted.length >= 2) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const delta = (last.score ?? 0) - (first.score ?? 0);
        if (delta > 5) trend14 = "improving";
        else if (delta < -5) trend14 = "declining";
        else trend14 = "stable";
      }

      const riskNarrative = describeTrend(trend14);

      return {
        patientId,
        patientName,
        indices,
        avgWorkout,
        avgMeals,
        avgHydration,
        avgSleep,
        avgMood,
        riskNarrative,
      };
    },
  });
}

// ---------- UI: MAIN DASHBOARD ------------

export function ClinicianDashboardScreen() {
  const { data, isLoading } = useClinicianPatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );

  const selectedPatient = useMemo(
    () => data?.find((p) => p.patientId === selectedPatientId),
    [data, selectedPatientId]
  );

  return (
    <div className="p-4 flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2 space-y-2">
        <h1 className="text-lg font-semibold">Patients</h1>
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading patient overview…
          </p>
        )}
        {!isLoading && (!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No active patients yet. Share your clinician link or code to
            connect.
          </p>
        )}

        <div className="space-y-2">
          {data?.map((p) => (
            <button
              key={p.patientId}
              type="button"
              onClick={() => setSelectedPatientId(p.patientId)}
              className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-accent/40 ${
                selectedPatientId === p.patientId ? "border-primary" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {p.patientName ?? "Unnamed patient"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Functional index:{" "}
                  {p.lastIndex !== null
                    ? `${p.lastIndex}/100`
                    : "No recent data"}
                  {" • "}
                  14-day avg:{" "}
                  {p.avg14 !== null ? `${p.avg14}/100` : "—"}
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>
                  Trend:{" "}
                  {p.trend14 === "improving"
                    ? "Improving"
                    : p.trend14 === "declining"
                    ? "Declining"
                    : p.trend14 === "stable"
                    ? "Stable"
                    : "Unknown"}
                </p>
                <p>Adherence: {p.adherenceScore ?? "—"}/100</p>
                {p.riskFlag === "alert" && (
                  <p className="text-red-600 mt-1">⚠ High risk</p>
                )}
                {p.riskFlag === "watch" && (
                  <p className="text-amber-600 mt-1">Watch</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:w-1/2 space-y-3">
        {selectedPatient ? (
          <ClinicianPatientDetailPanel patient={selectedPatient} />
        ) : (
          <p className="text-sm text-muted-foreground mt-6 md:mt-0">
            Select a patient to view their functional trend summary.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- UI: PATIENT DETAIL PANEL ------

function ClinicianPatientDetailPanel({
  patient,
}: {
  patient: ClinicianPatientSummary;
}) {
  const { data, isLoading } = useClinicianPatientDetail(patient.patientId);

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border bg-background p-4">
        <p className="text-sm text-muted-foreground">
          Loading patient details…
        </p>
      </div>
    );
  }

  const fmtPct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="rounded-xl border bg-background p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            Functional overview
          </p>
          <p className="text-lg font-semibold">
            {data.patientName ?? "Unnamed patient"}
          </p>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          <p>Last 30 days</p>
        </div>
      </div>

      {/* Functional index trend */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Functional wellness index (30-day trend)
        </p>
        <div className="flex items-end gap-1 h-16">
          {data.indices.map((idx) => {
            const height = (idx.value / 100) * 100;
            return (
              <div
                key={idx.date}
                className="flex-1 bg-primary/70 rounded-t"
                style={{ height: `${height || 4}%` }}
                title={`${idx.date}: ${idx.value}`}
              />
            );
          })}
        </div>
      </div>

      {/* Behavior averages */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <MetricCard
          label="Activity adherence"
          value={fmtPct(data.avgWorkout)}
        />
        <MetricCard
          label="Nutrition logging"
          value={fmtPct(data.avgMeals)}
        />
        <MetricCard
          label="Hydration sufficiency"
          value={fmtPct(data.avgHydration)}
        />
        <MetricCard
          label="Sleep vs goal"
          value={fmtPct(data.avgSleep)}
        />
        <MetricCard
          label="Reported energy/mood"
          value={fmtPct(data.avgMood)}
        />
      </div>

      {/* Narrative & secure notes placeholder */}
      <div className="space-y-2">
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Automated summary
          </p>
          <p className="text-xs mt-1">{data.riskNarrative}</p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Secure notes (cMixx / quantum-ready)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This area will display encrypted notes and communication,
            routed via xx network&apos;s cMixx for metadata protection.
            No raw logs or documents are shown here.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-2 py-2 space-y-1">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

// ========================================
// END CLINICIAN DASHBOARD FEATURE
// ========================================
