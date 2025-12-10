import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VideoSession {
  id: string;
  label: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  meetingUrl: string;
  createdAt: string;
  scheduledAt: string | null;
  clientId: string;
  clientName: string | null;
}

export function useVideoSessionsForProfessional() {
  return useQuery({
    queryKey: ["video-sessions-professional"],
    queryFn: async (): Promise<VideoSession[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      // Get live workout sessions where user is host (professional)
      const { data, error } = await supabase
        .from("live_workout_sessions")
        .select(`
          id,
          title,
          status,
          created_at,
          scheduled_start,
          host_id
        `)
        .eq("host_id", user.id)
        .in("status", ["scheduled", "active", "completed"])
        .order("scheduled_start", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((session): VideoSession => ({
        id: session.id,
        label: session.title || "Video Session",
        status: session.status === "active" ? "in_progress" : session.status as VideoSession["status"],
        meetingUrl: `/live-session/${session.id}`,
        createdAt: session.created_at,
        scheduledAt: session.scheduled_start,
        clientId: "",
        clientName: null,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
