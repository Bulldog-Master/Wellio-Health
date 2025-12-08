import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatWeight } from '@/lib/unitConversion';
import type { UnitSystem } from '@/lib/unitConversion';

interface WeightChartProps {
  chartData: any[];
  chartView: "daily" | "monthly" | "quarterly" | "yearly" | "year-by-year";
  chartLines: string[];
  targetWeight: number | null;
  preferredUnit: UnitSystem;
  getYAxisDomain: () => number[];
  chartLabels: {
    weightUnit: string;
    targetLabel: string;
    morning: string;
    evening: string;
    average: string;
  };
}

export const WeightChart = ({ 
  chartData, 
  chartView, 
  chartLines, 
  targetWeight, 
  preferredUnit, 
  getYAxisDomain,
  chartLabels 
}: WeightChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
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
            value: chartLabels.weightUnit, 
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
          content={(props) => {
            const { payload } = props;
            const items = [];
            
            payload?.forEach((entry: any, index: number) => {
              items.push(
                <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '14px', 
                    height: '14px', 
                    backgroundColor: entry.color,
                    borderRadius: '2px'
                  }} />
                  <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}>{entry.value}</span>
                </div>
              );
            });
            
            // Add target weight indicator if it exists and we're in daily view
            if (chartView === 'daily' && targetWeight && chartLabels.targetLabel) {
              items.push(
                <div key="target-weight" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="20" height="14" style={{ display: 'block' }}>
                    <line 
                      x1="0" 
                      y1="7" 
                      x2="20" 
                      y2="7" 
                      stroke="hsl(0, 85%, 60%)" 
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  </svg>
                  <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}>{chartLabels.targetLabel}</span>
                </div>
              );
            }
            
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', paddingTop: '20px', flexWrap: 'wrap' }}>
                {items}
              </div>
            );
          }}
        />
      
        {/* Target Weight Reference Line */}
        {targetWeight && (
          <ReferenceLine 
            y={targetWeight} 
            stroke="hsl(0, 85%, 60%)" 
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ 
              value: `Target: ${formatWeight(targetWeight, preferredUnit)}`, 
              position: 'right',
              fill: 'hsl(0, 85%, 60%)',
              fontSize: 12
            }}
          />
        )}
        
        {chartView === "daily" ? (
          <>
            <Bar 
              dataKey="morning" 
              fill="hsl(195, 100%, 50%)" 
              name={chartLabels.morning}
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="evening" 
              fill="hsl(270, 95%, 65%)" 
              name={chartLabels.evening}
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
            name={chartLabels.average}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
