import { useTranslation } from 'react-i18next';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface CareTeamState {
  hasCoach: boolean;
  hasClinician: boolean;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-background p-4 space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function WhoCanSeeMyDataSection({ hasCoach, hasClinician }: CareTeamState) {
  const { t } = useTranslation(['professional', 'common']);
  const anyone = hasCoach || hasClinician;

  return (
    <SectionCard title={t('who_can_see_my_data', 'Who can see my data?')}>
      {!anyone ? (
        <div className="flex items-start gap-3">
          <EyeOff className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t('data_visibility_none', "Right now, only you can see your detailed logs and functional wellness index. If you decide to connect a coach or clinician later, you'll choose who to share with from this screen.")}
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-3">
            <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p>
              {t('data_visibility_intro', 'The following professionals can access your functional wellness index and high-level trends. They do not see raw meal logs, workout notes, or medical documents by default.')}
            </p>
          </div>
          
          <ul className="list-disc pl-7 space-y-1">
            {hasCoach && (
              <li>
                <span className="font-semibold">{t('common:coach')}:</span>{' '}
                {t('coach_data_access', 'can view your functional scores, adherence, and trends to support your training plan.')}
              </li>
            )}
            {hasClinician && (
              <li>
                <span className="font-semibold">{t('common:clinician')}:</span>{' '}
                {t('clinician_data_access', 'can view your functional index and trend summaries to support clinical decision-making, not to replace diagnosis.')}
              </li>
            )}
          </ul>
          
          <p className="text-[11px] border-t pt-2 mt-2">
            {t('data_revoke_note', "You can revoke access at any time from this Care Team screen. Secure messaging uses end-to-end encryption and xx network's cMix for metadata protection.")}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
