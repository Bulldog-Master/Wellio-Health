import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DataPoint {
  date: string;
  value: number;
  prediction?: number;
}

interface AdvancedMetricsProps {
  data: DataPoint[];
  title: string;
  metric: string;
  unit: string;
  goal?: number;
}

export const AdvancedMetrics = ({ data, title, metric, unit, goal }: AdvancedMetricsProps) => {
  const { t } = useTranslation('fitness');
  // Calculate trend
  const trend = data.length >= 2 
    ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100 
    : 0;

  // Simple linear regression for prediction
  const predictions = calculatePredictions(data, 7); // 7 day prediction

  // Calculate correlation if multiple metrics exist
  const correlation = calculateCorrelation(data);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main trend chart with predictions */}
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={[...data, ...predictions]}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.2)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="prediction" 
              stroke="hsl(var(--primary) / 0.5)" 
              fill="hsl(var(--primary) / 0.1)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            {goal && (
              <Line 
                type="monotone" 
                dataKey={() => goal} 
                stroke="hsl(var(--accent))" 
                strokeDasharray="3 3"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('current')}</p>
            <p className="text-lg font-bold">
              {data[data.length - 1]?.value.toFixed(1)} {unit}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('average')}</p>
            <p className="text-lg font-bold">
              {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)} {unit}
            </p>
          </div>
          {goal && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                {t('goal')}
              </p>
              <p className="text-lg font-bold">
                {goal} {unit}
              </p>
            </div>
          )}
        </div>

        {/* Prediction */}
        {predictions.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">{t('seven_day_prediction')}</p>
            <p className="text-xs text-muted-foreground">
              {t('prediction_text')}{" "}
              <span className="font-semibold text-foreground">
                {predictions[predictions.length - 1].prediction?.toFixed(1)} {unit}
              </span>
              {goal && ` (${((predictions[predictions.length - 1].prediction || 0) / goal * 100).toFixed(0)}% ${t('of_goal')})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simple linear regression for predictions
function calculatePredictions(data: DataPoint[], days: number): DataPoint[] {
  if (data.length < 2) return [];

  const n = data.length;
  const sumX = data.reduce((sum, _, i) => sum + i, 0);
  const sumY = data.reduce((sum, d) => sum + d.value, 0);
  const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
  const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions: DataPoint[] = [];
  for (let i = 1; i <= days; i++) {
    const futureIndex = n + i;
    const predictedValue = slope * futureIndex + intercept;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    predictions.push({
      date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 0, // No actual value yet
      prediction: Math.max(0, predictedValue) // Prevent negative predictions
    });
  }

  return predictions;
}

// Calculate correlation (placeholder for multi-metric analysis)
function calculateCorrelation(data: DataPoint[]): number {
  // This could be expanded to correlate multiple metrics
  // For now, returns consistency score based on variance
  if (data.length < 2) return 0;
  
  const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const variance = data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower coefficient of variation = more consistent
  return Math.max(0, 100 - (stdDev / mean) * 100);
}
