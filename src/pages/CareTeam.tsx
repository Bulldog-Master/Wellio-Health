import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { CareTeamSection } from '@/components/profile/CareTeamSection';
import { SEOHead } from '@/components/common';

const CareTeam = () => {
  const { t } = useTranslation(['professional', 'common']);

  return (
    <>
      <SEOHead 
        titleKey="professional:my_care_team"
        descriptionKey="professional:my_care_team_desc"
      />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('my_care_team')}</h1>
            <p className="text-muted-foreground">{t('my_care_team_desc')}</p>
          </div>
        </div>

        <CareTeamSection defaultOpen={true} />
      </div>
    </>
  );
};

export default CareTeam;
