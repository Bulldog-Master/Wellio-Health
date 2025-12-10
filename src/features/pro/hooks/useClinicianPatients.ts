import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PatientSummary {
  id: string;
  displayName: string;
  latestFwi: number | null;
  trendDirection: "up" | "down" | "flat" | null;
  lastUpdated: string | null;
  flags: string[];
  adherence: {
    meals: number | null;
    hydration: number | null;
    sleep: number | null;
    workout: number | null;
    mood: number | null;
  };
}

export function useClinicianPatients() {
  return useQuery({
    queryKey: ["clinician-patients"],
    queryFn: async (): Promise<PatientSummary[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      // Get active clinician-patient relationships
      const { data: relationships, error: relError } = await supabase
        .from("clinician_patients")
        .select("id, patient_id, status")
        .eq("clinician_id", user.id)
        .eq("status", "active");

      if (relError) throw relError;
      if (!relationships || relationships.length === 0) return [];

      const patientIds = relationships.map((r) => r.patient_id);

      // Fetch profiles for patient names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", patientIds);

      // Get latest 14 days of daily scores for trend calculation
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: scores } = await supabase
        .from("daily_scores")
        .select("user_id, score, date, created_at, hydration_completion, meals_completion, sleep_completion, workout_completion, mood_score")
        .in("user_id", patientIds)
        .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false });

      // Group scores by patient
      const scoresByPatient = new Map<string, typeof scores>();
      scores?.forEach((score) => {
        if (!scoresByPatient.has(score.user_id)) {
          scoresByPatient.set(score.user_id, []);
        }
        scoresByPatient.get(score.user_id)?.push(score);
      });

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return relationships.map((rel): PatientSummary => {
        const profile = profilesMap.get(rel.patient_id);
        const patientScores = scoresByPatient.get(rel.patient_id) || [];
        const latest = patientScores[0];
        
        // Calculate 14-day trend: compare avg of first 7 days vs last 7 days
        let trendDirection: PatientSummary["trendDirection"] = null;
        if (patientScores.length >= 4) {
          const midpoint = Math.floor(patientScores.length / 2);
          const recentScores = patientScores.slice(0, midpoint);
          const olderScores = patientScores.slice(midpoint);
          
          const recentAvg = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
          const olderAvg = olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length;
          
          const diff = recentAvg - olderAvg;
          if (diff > 5) trendDirection = "up";
          else if (diff < -5) trendDirection = "down";
          else trendDirection = "flat";
        }

        // Compute flags based on latest adherence
        const flags: string[] = [];
        if (latest) {
          if ((latest.sleep_completion ?? 0) < 50) flags.push("Sleep ↓");
          else if ((latest.sleep_completion ?? 0) >= 80) flags.push("Sleep ✓");
          
          if ((latest.hydration_completion ?? 0) >= 80) flags.push("Hydration ✓");
          else if ((latest.hydration_completion ?? 0) < 40) flags.push("Hydration ↓");
          
          if ((latest.meals_completion ?? 0) >= 80) flags.push("Meals ✓");
          
          if ((latest.workout_completion ?? 0) < 30) flags.push("Activity ↓");
          else if ((latest.workout_completion ?? 0) >= 70) flags.push("Activity ✓");
          
          if ((latest.mood_score ?? 0) >= 70) flags.push("Mood stable");
          else if ((latest.mood_score ?? 0) < 40) flags.push("Mood ↓");
        }

        return {
          id: rel.patient_id,
          displayName: profile?.full_name || "Patient",
          latestFwi: latest?.score ?? null,
          trendDirection,
          lastUpdated: latest?.created_at ?? null,
          flags,
          adherence: {
            meals: latest?.meals_completion ?? null,
            hydration: latest?.hydration_completion ?? null,
            sleep: latest?.sleep_completion ?? null,
            workout: latest?.workout_completion ?? null,
            mood: latest?.mood_score ?? null,
          },
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
