import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ProgressPhotoComparison from "@/components/progress/ProgressPhotoComparison";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProgressComparison = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const navigate = useNavigate();

  return (
    <Layout>
      <SEOHead 
        titleKey="seo:progress_comparison_title"
        descriptionKey="seo:progress_comparison_desc"
      />
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('fitness:progress_comparison')}</h1>
            <p className="text-muted-foreground">{t('fitness:compare_progress_photos')}</p>
          </div>
        </div>

        <ProgressPhotoComparison />
      </div>
    </Layout>
  );
};

export default ProgressComparison;
