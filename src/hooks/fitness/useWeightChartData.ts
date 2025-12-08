import { useMemo } from 'react';
import { format, startOfMonth, startOfQuarter, startOfYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { WeightLog } from './useWeightLogs';

export type ChartView = "daily" | "monthly" | "quarterly" | "yearly" | "year-by-year";

export const useWeightChartData = (
  weightLogs: WeightLog[],
  chartView: ChartView,
  targetWeight: number | null
) => {
  const { i18n } = useTranslation();
  const dateLocale = i18n.language === 'es' ? es : undefined;

  const chartData = useMemo(() => {
    if (!weightLogs.length) return [];

    let result: any[] = [];
    
    switch (chartView) {
      case "daily": {
        const dailyData = weightLogs.reduce((acc, log) => {
          const date = format(parseISO(log.logged_at), "MMM dd", { locale: dateLocale });
          const existing = acc.find(d => d.date === date);
          if (existing) {
            if (log.period === "morning") existing.morning = log.weight_lbs;
            if (log.period === "evening") existing.evening = log.weight_lbs;
          } else {
            acc.push({
              date,
              morning: log.period === "morning" ? log.weight_lbs : null,
              evening: log.period === "evening" ? log.weight_lbs : null,
            });
          }
          return acc;
        }, [] as any[]);
        result = dailyData;
        break;
      }
      
      case "monthly": {
        const monthlyData = weightLogs.reduce((acc, log) => {
          const month = format(startOfMonth(parseISO(log.logged_at)), "MMM yyyy", { locale: dateLocale });
          const existing = acc.find(d => d.date === month);
          if (existing) {
            existing.totalWeight += log.weight_lbs;
            existing.count += 1;
          } else {
            acc.push({ date: month, totalWeight: log.weight_lbs, count: 1 });
          }
          return acc;
        }, [] as any[]);
        result = monthlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
        break;
      }
      
      case "quarterly": {
        const quarterlyData = weightLogs.reduce((acc, log) => {
          const quarter = format(startOfQuarter(parseISO(log.logged_at)), "QQQ yyyy", { locale: dateLocale });
          const existing = acc.find(d => d.date === quarter);
          if (existing) {
            existing.totalWeight += log.weight_lbs;
            existing.count += 1;
          } else {
            acc.push({ date: quarter, totalWeight: log.weight_lbs, count: 1 });
          }
          return acc;
        }, [] as any[]);
        result = quarterlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
        break;
      }
      
      case "yearly": {
        const yearlyData = weightLogs.reduce((acc, log) => {
          const year = format(startOfYear(parseISO(log.logged_at)), "yyyy", { locale: dateLocale });
          const existing = acc.find(d => d.date === year);
          if (existing) {
            existing.totalWeight += log.weight_lbs;
            existing.count += 1;
          } else {
            acc.push({ date: year, totalWeight: log.weight_lbs, count: 1 });
          }
          return acc;
        }, [] as any[]);
        result = yearlyData.map(d => ({ date: d.date, average: d.totalWeight / d.count }));
        break;
      }
      
      case "year-by-year": {
        const yearlyData = weightLogs.reduce((acc, log) => {
          const year = format(parseISO(log.logged_at), "yyyy", { locale: dateLocale });
          const month = format(parseISO(log.logged_at), "MMM", { locale: dateLocale });
          if (!acc[year]) acc[year] = {};
          if (!acc[year][month]) acc[year][month] = { totalWeight: 0, count: 0 };
          acc[year][month].totalWeight += log.weight_lbs;
          acc[year][month].count += 1;
          return acc;
        }, {} as Record<string, Record<string, { totalWeight: number; count: number }>>);
        
        const tempResult = [];
        for (const [year, months] of Object.entries(yearlyData)) {
          for (const [month, data] of Object.entries(months)) {
            tempResult.push({
              date: month,
              [year]: data.totalWeight / data.count,
            });
          }
        }
        
        const consolidated = tempResult.reduce((acc, item) => {
          const existing = acc.find(d => d.date === item.date);
          if (existing) {
            Object.assign(existing, item);
          } else {
            acc.push(item);
          }
          return acc;
        }, [] as any[]);
        
        result = consolidated;
        break;
      }
    }
    
    if (targetWeight) {
      result = result.map(d => ({ ...d, target: targetWeight }));
    }
    
    return result;
  }, [weightLogs, chartView, targetWeight, dateLocale]);

  const chartLines = useMemo(() => {
    if (chartView === "year-by-year" && chartData.length > 0) {
      const years = Object.keys(chartData[0]).filter(key => key !== "date");
      return years;
    }
    return [];
  }, [chartData, chartView]);

  const getYAxisDomain = (): [number, number] => {
    if (!chartData.length) return [0, 100];
    const values = chartData.flatMap(d => 
      Object.entries(d)
        .filter(([key]) => key !== "date")
        .map(([, value]) => value as number)
        .filter(v => v != null)
    );
    
    if (targetWeight) {
      values.push(targetWeight);
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  return {
    chartData,
    chartLines,
    getYAxisDomain,
  };
};
