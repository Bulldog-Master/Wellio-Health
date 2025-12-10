// ========================================
// WELLIO HEALTH - CLINICIAN DASHBOARD FEATURE
// Functional trend view for physicians/clinicians
// Dark B+ Theme with FWI gauges and trend lines
// ========================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { VideoSessionsPanel } from "@/features/pro";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Eye, 
  MessageSquare,
  Lock,
  Video,
  Activity,
  Utensils,
  Droplets,
  Moon,
  Smile,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------- TYPES ------------------------

export interface ClinicianPatientSummary {
  patientId: string;
  patientName: string | null;
  lastIndex: number | null;
  avg14: number | null;
  trend14: "improving" | "declining" | "stable" | "unknown";
  adherenceScore: number | null;
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
  trend14: "improving" | "declining" | "stable" | "unknown";
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
  if (lastIndex < 40 && trend14 === "declining") return "alert";
  if (lastIndex < 50 || (trend14 === "declining" && avg14 < 60)) return "watch";
  return "none";
}

// ---------- FWI GAUGE COMPONENT ----------

function FWIGauge({ value, size = "md" }: { value: number | null; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28"
  };
  
  const textClasses = {
    sm: "text-xs",
    md: "text-lg",
    lg: "text-2xl"
  };

  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const displayValue = value ?? 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (displayValue / 100) * circumference;
  
  // Color based on value
  const getColor = () => {
    if (value === null) return "hsl(var(--muted-foreground))";
    if (value >= 70) return "hsl(var(--primary))";
    if (value >= 50) return "hsl(142 76% 36%)"; // green
    if (value >= 30) return "hsl(45 93% 47%)"; // amber
    return "hsl(0 84% 60%)"; // red
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-bold", textClasses[size])}>
          {value !== null ? value : "—"}
        </span>
      </div>
    </div>
  );
}

// ---------- MINI TREND LINE COMPONENT ----

function MiniTrendLine({ data, className }: { data: number[]; className?: string }) {
  if (data.length === 0) return null;
  
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className={cn("w-full h-8", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(180 100% 50%)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="url(#trendGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------- HOOK: PATIENT LIST -----------

function useClinicianPatients() {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ["clinicianPatients", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ClinicianPatientSummary[]> => {
      if (!user?.id) return [];

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

        const denom = Math.max(patientScores.length, 1);
        const avgWorkout =
          patientScores.reduce((sum, s) => sum + (s.workout_completion ?? 0), 0) / denom;
        const avgMeals =
          patientScores.reduce((sum, s) => sum + (s.meals_completion ?? 0), 0) / denom;
        const avgHydration =
          patientScores.reduce((sum, s) => sum + (s.hydration_completion ?? 0), 0) / denom;
        const avgSleep =
          patientScores.reduce((sum, s) => sum + (s.sleep_completion ?? 0), 0) / denom;

        const adherenceScore = Math.round(
          (avgWorkout * 0.4 + avgMeals * 0.25 + avgHydration * 0.2 + avgSleep * 0.15) * 100
        );

        const riskFlag = evaluateRiskFlag({ lastIndex, avg14, trend14 });

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

      const sorted = (scores ?? []).sort((a, b) => (a.date < b.date ? -1 : 1));
      const indices = sorted.map((s) => ({ date: s.date, value: s.score }));

      const denom = Math.max(sorted.length, 1);
      const avgWorkout = sorted.reduce((sum, s) => sum + (s.workout_completion ?? 0), 0) / denom;
      const avgMeals = sorted.reduce((sum, s) => sum + (s.meals_completion ?? 0), 0) / denom;
      const avgHydration = sorted.reduce((sum, s) => sum + (s.hydration_completion ?? 0), 0) / denom;
      const avgSleep = sorted.reduce((sum, s) => sum + (s.sleep_completion ?? 0), 0) / denom;
      const avgMood = sorted.reduce((sum, s) => sum + (s.mood_score ?? 0), 0) / denom;

      let trend14: ClinicianPatientSummary["trend14"] = "unknown";
      if (sorted.length >= 2) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const delta = (last.score ?? 0) - (first.score ?? 0);
        if (delta > 5) trend14 = "improving";
        else if (delta < -5) trend14 = "declining";
        else trend14 = "stable";
      }

      const riskNarrative = trend14 === "improving" 
        ? "trend_improving" 
        : trend14 === "declining" 
        ? "trend_declining" 
        : trend14 === "stable" 
        ? "trend_stable" 
        : "trend_unknown";

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
        trend14,
      };
    },
  });
}

// ---------- UI: PATIENT CARD -------------

function PatientCard({ 
  patient, 
  isSelected, 
  onClick 
}: { 
  patient: ClinicianPatientSummary; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation(['clinician']);

  const TrendIcon = patient.trend14 === "improving" 
    ? TrendingUp 
    : patient.trend14 === "declining" 
    ? TrendingDown 
    : Minus;

  const trendColor = patient.trend14 === "improving" 
    ? "text-green-500" 
    : patient.trend14 === "declining" 
    ? "text-red-500" 
    : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card/50 backdrop-blur-sm p-4 text-left transition-all hover:bg-accent/20",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        isSelected && "border-primary bg-primary/5 shadow-lg shadow-primary/10"
      )}
    >
      <div className="flex items-start gap-4">
        {/* FWI Gauge */}
        <FWIGauge value={patient.lastIndex} size="sm" />
        
        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">
              {patient.patientName ?? t('clinician:unnamed_patient')}
            </p>
            {patient.riskFlag === "alert" && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {t('clinician:high_risk')}
              </Badge>
            )}
            {patient.riskFlag === "watch" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-500">
                <Eye className="w-3 h-3 mr-1" />
                {t('clinician:watch')}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{t('clinician:functional_index')}: {patient.lastIndex ?? "—"}</span>
            <span>•</span>
            <span>{t('clinician:day_avg')}: {patient.avg14 ?? "—"}</span>
          </div>

          {/* Mini trend line placeholder */}
          <div className="mt-2 flex items-center gap-2">
            <TrendIcon className={cn("w-4 h-4", trendColor)} />
            <span className={cn("text-xs", trendColor)}>
              {t(`clinician:${patient.trend14}`)}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {t('clinician:adherence')}: {patient.adherenceScore ?? "—"}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------- UI: MAIN DASHBOARD ------------

export function ClinicianDashboardScreen() {
  const { t } = useTranslation(['clinician', 'professional', 'live']);
  const { data, isLoading } = useClinicianPatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const selectedPatient = useMemo(
    () => data?.find((p) => p.patientId === selectedPatientId),
    [data, selectedPatientId]
  );

  return (
    <div className="space-y-6">
      {/* Video Sessions Panel */}
      <VideoSessionsPanel />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Patients Grid */}
        <div className="lg:w-1/2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('clinician:patients')}</h2>
            {data && data.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {data.length} {t('clinician:patients').toLowerCase()}
              </Badge>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {t('clinician:loading_patients')}
            </div>
          )}

          {!isLoading && (!data || data.length === 0) && (
            <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t('clinician:no_patients')}
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {data?.map((p) => (
              <PatientCard
                key={p.patientId}
                patient={p}
                isSelected={selectedPatientId === p.patientId}
                onClick={() => setSelectedPatientId(p.patientId)}
              />
            ))}
          </div>
        </div>

        {/* Patient Detail Panel */}
        <div className="lg:w-1/2">
          {selectedPatient ? (
            <ClinicianPatientDetailPanel patient={selectedPatient} />
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {t('clinician:select_patient')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- UI: PATIENT DETAIL PANEL ------

function ClinicianPatientDetailPanel({ patient }: { patient: ClinicianPatientSummary }) {
  const { t } = useTranslation(['clinician']);
  const { data, isLoading } = useClinicianPatientDetail(patient.patientId);

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {t('clinician:loading_details')}
        </div>
      </div>
    );
  }

  const fmtPct = (v: number) => `${Math.round(v * 100)}%`;
  const trendData = data.indices.map(i => i.value);

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground tracking-wider">
            {t('clinician:functional_overview')}
          </p>
          <p className="text-xl font-bold mt-1">
            {data.patientName ?? t('clinician:unnamed_patient')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <Lock className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline">
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Large FWI Gauge */}
      <div className="flex items-center gap-6">
        <FWIGauge value={patient.lastIndex} size="lg" />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t('clinician:functional_wellness_index')}
          </p>
          <MiniTrendLine data={trendData} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t('clinician:last_30_days')}</span>
            <span>•</span>
            <span className={cn(
              data.trend14 === "improving" && "text-green-500",
              data.trend14 === "declining" && "text-red-500"
            )}>
              {t(`clinician:${data.trend14}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Adherence Model Grid */}
      <div className="space-y-3">
        <p className="text-xs uppercase text-muted-foreground tracking-wider">
          {t('clinician:adherence')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AdherenceCard 
            icon={Activity} 
            label={t('clinician:activity_adherence')} 
            value={fmtPct(data.avgWorkout)}
            progress={data.avgWorkout}
          />
          <AdherenceCard 
            icon={Utensils} 
            label={t('clinician:nutrition_logging')} 
            value={fmtPct(data.avgMeals)}
            progress={data.avgMeals}
          />
          <AdherenceCard 
            icon={Droplets} 
            label={t('clinician:hydration_sufficiency')} 
            value={fmtPct(data.avgHydration)}
            progress={data.avgHydration}
          />
          <AdherenceCard 
            icon={Moon} 
            label={t('clinician:sleep_vs_goal')} 
            value={fmtPct(data.avgSleep)}
            progress={data.avgSleep}
          />
          <AdherenceCard 
            icon={Smile} 
            label={t('clinician:reported_mood')} 
            value={fmtPct(data.avgMood)}
            progress={data.avgMood}
          />
        </div>
      </div>

      {/* Automated Summary */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-2">
        <p className="text-xs uppercase text-muted-foreground tracking-wider">
          {t('clinician:automated_summary')}
        </p>
        <p className="text-sm">{t(`clinician:${data.riskNarrative}`)}</p>
      </div>

      {/* Secure Notes Placeholder */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <p className="text-xs uppercase text-muted-foreground tracking-wider">
            {t('clinician:secure_notes')}
          </p>
          <Badge variant="outline" className="text-[10px] ml-auto">
            PQ + cMixx
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('clinician:coming_soon')}
        </p>
      </div>
    </div>
  );
}

// ---------- ADHERENCE CARD COMPONENT ------

function AdherenceCard({ 
  icon: Icon, 
  label, 
  value,
  progress 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  progress: number;
}) {
  const progressColor = progress >= 0.7 
    ? "bg-green-500" 
    : progress >= 0.4 
    ? "bg-amber-500" 
    : "bg-red-500";

  return (
    <div className="rounded-lg border bg-card/50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", progressColor)}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ========================================
// END CLINICIAN DASHBOARD FEATURE
// ========================================
