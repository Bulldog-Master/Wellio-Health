import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useUserPreferences } from "@/hooks/utils";
import { formatWeight } from "@/lib/unitConversion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWeightLogs, useWeightChartData, type WeightLog, type ChartView } from "@/hooks/fitness";
import { 
  WeightLogForm, 
  WeightLogList, 
  WeightProgressStats, 
  WeightChartSection 
} from "@/components/weight";

const Weight = () => {
  const { t } = useTranslation(['weight', 'common']);
  const navigate = useNavigate();
  const { preferredUnit, updatePreferredUnit, isLoading: prefsLoading } = useUserPreferences();
  
  const [morning, setMorning] = useState("");
  const [evening, setEvening] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [chartView, setChartView] = useState<ChartView>("monthly");

  const {
    weightLogs,
    isLoading,
    targetWeight,
    latestWeight,
    statistics,
    handleLogWeight,
    handleEditLog,
    handleDeleteLog,
  } = useWeightLogs(preferredUnit);

  const { chartData, chartLines, getYAxisDomain } = useWeightChartData(
    weightLogs,
    chartView,
    targetWeight
  );

  const onLogWeight = async (period: "morning" | "evening") => {
    const weight = period === "morning" ? morning : evening;
    const success = await handleLogWeight(weight, period, selectedDate);
    if (success) {
      if (period === "morning") setMorning("");
      else setEvening("");
    }
  };

  const onEditLog = async (log: WeightLog) => {
    const success = await handleEditLog(log, editWeight);
    if (success) {
      setEditingLog(null);
      setEditWeight("");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/activity")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('weight:back_to_activity')}
      </Button>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('weight:weight_tracking')}</h1>
            <p className="text-muted-foreground mt-1">{t('weight:monitor_changes')}</p>
          </div>
        </div>
        
        <div className="w-32">
          <Select
            value={preferredUnit}
            onValueChange={(value) => updatePreferredUnit(value as 'imperial' | 'metric')}
            disabled={prefsLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imperial">lbs</SelectItem>
              <SelectItem value="metric">kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <WeightLogForm
          morning={morning}
          setMorning={setMorning}
          evening={evening}
          setEvening={setEvening}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          preferredUnit={preferredUnit}
          onLogWeight={onLogWeight}
        />

        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('weight:current_weight')}</h3>
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-primary mb-2">
              {formatWeight(latestWeight, preferredUnit)}
            </div>
            <p className="text-muted-foreground">{t('weight:latest_reading')}</p>
          </div>
        </Card>
      </div>

      <WeightProgressStats
        statistics={statistics}
        targetWeight={targetWeight}
        preferredUnit={preferredUnit}
      />

      <WeightChartSection
        chartData={chartData}
        chartView={chartView}
        setChartView={setChartView}
        chartLines={chartLines}
        targetWeight={targetWeight}
        preferredUnit={preferredUnit}
        isLoading={isLoading}
        getYAxisDomain={getYAxisDomain}
      />

      <WeightLogList
        weightLogs={weightLogs}
        isLoading={isLoading}
        preferredUnit={preferredUnit}
        editingLog={editingLog}
        editWeight={editWeight}
        setEditingLog={setEditingLog}
        setEditWeight={setEditWeight}
        onEditLog={onEditLog}
        onDeleteLog={handleDeleteLog}
      />
    </div>
  );
};

export default Weight;
