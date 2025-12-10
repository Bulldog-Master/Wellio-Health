import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { formatWeight } from "@/lib/utils";
import { type ChartView } from "@/hooks/fitness";

interface WeightChartSectionProps {
  chartData: any[];
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  chartLines: string[];
  targetWeight: number | null;
  preferredUnit: 'imperial' | 'metric';
  isLoading: boolean;
  getYAxisDomain: () => [number, number];
}

export const WeightChartSection = ({
  chartData,
  chartView,
  setChartView,
  chartLines,
  targetWeight,
  preferredUnit,
  isLoading,
  getYAxisDomain,
}: WeightChartSectionProps) => {
  const { t } = useTranslation('weight');

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <h3 className="text-lg font-semibold mb-6">{t('weight_trends')}</h3>
      <Tabs value={chartView} onValueChange={(v) => setChartView(v as ChartView)} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
          <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
          <TabsTrigger value="quarterly">{t('quarterly')}</TabsTrigger>
          <TabsTrigger value="yearly">{t('yearly')}</TabsTrigger>
          <TabsTrigger value="year-by-year">{t('year_by_year')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
      ) : !chartData || chartData.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t('no_chart_data')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              domain={getYAxisDomain()}
              className="text-xs"
              tick={{ fill: 'hsl(var(--foreground))' }}
              label={{ 
                value: preferredUnit === 'imperial' ? 'lbs' : 'kg', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'hsl(var(--foreground))' }
              }}
              tickFormatter={(value) => formatWeight(value, preferredUnit).split(' ')[0]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => formatWeight(value, preferredUnit)}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            
            {chartView === "daily" ? (
              <>
                <Bar 
                  dataKey="morning" 
                  fill="hsl(195, 100%, 50%)" 
                  name={t('morning')}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="evening" 
                  fill="hsl(270, 95%, 65%)" 
                  name={t('evening')}
                  radius={[4, 4, 0, 0]}
                />
              </>
            ) : chartView === "year-by-year" ? (
              chartLines.map((year, index) => {
                const colors = [
                  'hsl(var(--primary))',
                  'hsl(var(--secondary))',
                  'hsl(var(--accent))',
                  'hsl(217, 91%, 60%)',
                  'hsl(142, 71%, 45%)',
                  'hsl(262, 83%, 58%)',
                ];
                return (
                  <Bar
                    key={year}
                    dataKey={year}
                    fill={colors[index % colors.length]}
                    name={year}
                    radius={[4, 4, 0, 0]}
                  />
                );
              })
            ) : (
              <Bar 
                dataKey="average" 
                fill="hsl(var(--primary))" 
                name={t('average')}
                radius={[4, 4, 0, 0]}
              />
            )}
            
            {targetWeight && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(0, 85%, 60%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={t('target_weight')}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
