import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, ArrowLeft } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useProgressChallenges } from "@/hooks/challenges";
import { ChallengeCreateForm, ChallengeCard } from "@/components/challenges";

const ProgressChallenges = () => {
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();
  const { t } = useTranslation(['challenges', 'common']);
  
  const {
    challenges,
    loading,
    showCreateForm,
    setShowCreateForm,
    formData,
    setFormData,
    createChallenge,
  } = useProgressChallenges();

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/premium')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('challenges:progress_challenges')}</h1>
              <p className="text-muted-foreground">{t('challenges:progress_challenges_desc')}</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (!hasFeature('custom_challenges')) {
                navigate('/subscription');
                return;
              }
              setShowCreateForm(!showCreateForm);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {showCreateForm ? t('challenges:cancel') : t('challenges:create_challenge')}
          </Button>
        </div>

        {showCreateForm && !hasFeature('custom_challenges') && (
          <UpgradePrompt feature="Custom Challenges" />
        )}

        {showCreateForm && hasFeature('custom_challenges') && (
          <ChallengeCreateForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={createChallenge}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">{t('challenges:loading_challenges')}</p>
          ) : challenges.length === 0 ? (
            <p className="text-muted-foreground">{t('challenges:no_challenges')}</p>
          ) : (
            challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProgressChallenges;
