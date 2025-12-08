import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useWeeklyReport } from "@/hooks/fitness/useWeeklyReport";
import { ReportHighlights, ReportStatsGrid, ReportDetailCards } from "@/components/progress";

const WeeklyProgressReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['fitness', 'common']);
  const { report, isLoading, fetchReport } = useWeeklyReport();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('fitness:weekly_progress_report')}</h1>
            {report && (
              <p className="text-muted-foreground">
                {format(new Date(report.period.start), 'MMM d')} - {format(new Date(report.period.end), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={fetchReport} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('common:refresh')}
        </Button>
      </div>

      {report && (
        <>
          <ReportHighlights highlights={report.highlights} />
          <ReportStatsGrid report={report} />
          <ReportDetailCards report={report} />
        </>
      )}
    </div>
  );
};

export default WeeklyProgressReport;
