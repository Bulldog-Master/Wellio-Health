import { useVideoSessionsForProfessional } from "../hooks/useVideoSessionsForProfessional";
import { useTranslation } from "react-i18next";
import { Video, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoSessionsPanel() {
  const { t } = useTranslation(["clinician", "common"]);
  const { data, isLoading, error } = useVideoSessionsForProfessional();

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-background p-3">
        <p className="text-xs text-muted-foreground">{t("loading_sessions")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-background p-3">
        <p className="text-xs text-destructive">{t("error_loading_sessions")}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-background p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {t("video_sessions")}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{t("no_video_sessions")}</p>
        <Button size="sm" variant="outline" className="w-full text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {t("schedule_session")}
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-blue-500";
      case "in_progress": return "text-green-500";
      case "completed": return "text-muted-foreground";
      case "cancelled": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="rounded-xl border bg-background p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Video className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {t("video_sessions")}
        </p>
      </div>
      <ul className="space-y-2">
        {data.map((session) => (
          <li
            key={session.id}
            className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30"
          >
            <div className="space-y-0.5">
              <p className="font-medium">{session.label}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {session.scheduledAt 
                    ? new Date(session.scheduledAt).toLocaleString()
                    : new Date(session.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            {session.status !== "completed" && session.status !== "cancelled" && (
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] rounded-md border px-2 py-1 hover:bg-accent/40 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {t("common:join")}
              </a>
            )}
          </li>
        ))}
      </ul>
      <Button size="sm" variant="outline" className="w-full text-xs mt-2">
        <Calendar className="h-3 w-3 mr-1" />
        {t("schedule_session")}
      </Button>
    </div>
  );
}
