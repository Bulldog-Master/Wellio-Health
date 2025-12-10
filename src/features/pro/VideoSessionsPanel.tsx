import { useTranslation } from "react-i18next";
import { useVideoSessionsForProfessional } from "./videoSessions";

export function VideoSessionsPanel() {
  const { t } = useTranslation(['professional', 'live']);
  const { data, isLoading } = useVideoSessionsForProfessional();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-xs text-muted-foreground">
          {t('live:loading_sessions', 'Loading video sessions…')}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-xs text-muted-foreground">
          {t('professional:no_video_sessions', 'No video sessions yet. Schedule a session with a client from your Wellio workflow.')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {t('live:live_sessions', 'Video sessions')}
      </p>
      <ul className="space-y-1">
        {data.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between text-xs"
          >
            <div>
              <p className="font-medium">
                {s.label || t('professional:session', 'Session')} • {s.status}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(s.createdAt).toLocaleString()}
              </p>
            </div>
            <a
              href={s.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] rounded-md border border-border px-2 py-1 hover:bg-accent/40 transition-colors"
            >
              {t('live:join_session', 'Join')}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
