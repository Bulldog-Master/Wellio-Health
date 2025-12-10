import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VideoSessionStatus =
  | "scheduled"
  | "in_session"
  | "completed"
  | "cancelled";

export interface VideoSession {
  id: string;
  professionalId: string;
  clientId: string;
  role: "coach" | "clinician";
  status: VideoSessionStatus;
  meetingUrl: string;
  label: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

/**
 * Hook to fetch video sessions for a professional
 */
export function useVideoSessionsForProfessional() {
  return useQuery({
    queryKey: ["videoSessions", "professional"],
    queryFn: async (): Promise<VideoSession[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("video_sessions")
        .select(
          "id, professional_id, client_id, role, status, meeting_url, label, started_at, ended_at, created_at"
        )
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (
        data?.map((row) => ({
          id: row.id,
          professionalId: row.professional_id,
          clientId: row.client_id,
          role: row.role as "coach" | "clinician",
          status: row.status as VideoSessionStatus,
          meetingUrl: row.meeting_url,
          label: row.label,
          startedAt: row.started_at,
          endedAt: row.ended_at,
          createdAt: row.created_at,
        })) ?? []
      );
    },
  });
}

/**
 * Hook to fetch video sessions for a client
 */
export function useVideoSessionsForClient() {
  return useQuery({
    queryKey: ["videoSessions", "client"],
    queryFn: async (): Promise<VideoSession[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("video_sessions")
        .select(
          "id, professional_id, client_id, role, status, meeting_url, label, started_at, ended_at, created_at"
        )
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (
        data?.map((row) => ({
          id: row.id,
          professionalId: row.professional_id,
          clientId: row.client_id,
          role: row.role as "coach" | "clinician",
          status: row.status as VideoSessionStatus,
          meetingUrl: row.meeting_url,
          label: row.label,
          startedAt: row.started_at,
          endedAt: row.ended_at,
          createdAt: row.created_at,
        })) ?? []
      );
    },
  });
}

/**
 * Hook to create a new video session
 */
export function useCreateVideoSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opts: {
      clientId: string;
      role: "coach" | "clinician";
      meetingUrl: string;
      label?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Not authenticated");

      const { clientId, role, meetingUrl, label } = opts;

      const { data, error } = await supabase
        .from("video_sessions")
        .insert({
          professional_id: user.id,
          client_id: clientId,
          role,
          status: "scheduled",
          meeting_url: meetingUrl,
          label: label ?? null,
        })
        .select("id")
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["videoSessions", "professional"],
      });
    },
  });
}

/**
 * Hook to update video session status
 */
export function useUpdateVideoSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opts: {
      sessionId: string;
      status?: VideoSessionStatus;
      startedAt?: string;
      endedAt?: string;
    }) => {
      const { sessionId, status, startedAt, endedAt } = opts;

      const updateData: Record<string, unknown> = {};
      if (status) updateData.status = status;
      if (startedAt) updateData.started_at = startedAt;
      if (endedAt) updateData.ended_at = endedAt;

      const { error } = await supabase
        .from("video_sessions")
        .update(updateData)
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["videoSessions"],
      });
    },
  });
}
