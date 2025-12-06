import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, ArrowLeft, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";

const DataExport = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedData, setSelectedData] = useState<Set<string>>(new Set([
    'profile', 'activity_logs', 'nutrition_logs', 'wearable_data', 'habits'
  ]));

  const dataTypes = [
    { id: 'profile', label: t('profile_data'), table: 'profiles' },
    { id: 'activity_logs', label: t('activity_logs'), table: 'activity_logs' },
    { id: 'nutrition_logs', label: t('nutrition_logs'), table: 'nutrition_logs' },
    { id: 'wearable_data', label: t('wearable_data'), table: 'wearable_data' },
    { id: 'habits', label: t('habits_data'), table: 'habits' },
    { id: 'habit_completions', label: t('habit_completions'), table: 'habit_completions' },
    { id: 'body_measurements', label: t('body_measurements'), table: 'body_measurements' },
    { id: 'personal_records', label: t('personal_records'), table: 'personal_records' },
    { id: 'fitness_events', label: t('fitness_events'), table: 'fitness_events' },
    { id: 'posts', label: t('posts_data'), table: 'posts' },
  ];

  const toggleDataType = (id: string) => {
    const newSelected = new Set(selectedData);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedData(newSelected);
  };

  const selectAll = () => {
    setSelectedData(new Set(dataTypes.map(d => d.id)));
  };

  const deselectAll = () => {
    setSelectedData(new Set());
  };

  const exportData = async () => {
    if (selectedData.size === 0) {
      toast({
        title: t('common:warning'),
        description: t('select_data_to_export'),
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common:error'),
          description: t('please_login'),
          variant: "destructive",
        });
        return;
      }

      const exportedData: Record<string, unknown> = {};

      for (const dataType of dataTypes) {
        if (selectedData.has(dataType.id)) {
          let query = supabase.from(dataType.table as any).select('*');
          
          // Add user_id filter for user-specific tables
          if (dataType.table !== 'profiles') {
            query = query.eq('user_id', user.id);
          } else {
            query = query.eq('id', user.id);
          }

          const { data, error } = await query;
          
          if (error) {
            console.error(`Error fetching ${dataType.table}:`, error);
          } else {
            exportedData[dataType.id] = data;
          }
        }
      }

      // Add export metadata
      exportedData.metadata = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        format: exportFormat,
      };

      let blob: Blob;
      let filename: string;

      if (exportFormat === 'json') {
        blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
        filename = `wellio-export-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // Convert to CSV (simplified - just the first selected data type)
        const firstKey = [...selectedData][0];
        const firstData = exportedData[firstKey] as Record<string, unknown>[];
        
        if (firstData && firstData.length > 0) {
          const headers = Object.keys(firstData[0]).join(',');
          const rows = firstData.map(row => 
            Object.values(row).map(v => 
              typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
            ).join(',')
          ).join('\n');
          blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
          filename = `wellio-export-${firstKey}-${new Date().toISOString().split('T')[0]}.csv`;
        } else {
          throw new Error('No data to export');
        }
      }

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t('common:success'),
        description: t('data_exported_successfully'),
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('common:error'),
        description: t('export_failed'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Download className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('data_export')}</h1>
            <p className="text-muted-foreground">{t('export_your_data')}</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('select_format')}</h2>
        <div className="flex gap-4">
          <Button
            variant={exportFormat === 'json' ? 'default' : 'outline'}
            onClick={() => setExportFormat('json')}
            className="flex items-center gap-2"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </Button>
          <Button
            variant={exportFormat === 'csv' ? 'default' : 'outline'}
            onClick={() => setExportFormat('csv')}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
        </div>
        {exportFormat === 'csv' && (
          <p className="text-sm text-muted-foreground mt-2">
            {t('csv_note')}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('select_data')}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              {t('select_all')}
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll}>
              {t('deselect_all')}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataTypes.map((dataType) => (
            <div 
              key={dataType.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox 
                id={dataType.id}
                checked={selectedData.has(dataType.id)}
                onCheckedChange={() => toggleDataType(dataType.id)}
              />
              <Label htmlFor={dataType.id} className="cursor-pointer flex-1">
                {dataType.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={exportData} 
          disabled={isExporting || selectedData.size === 0}
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('exporting')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {t('export_data')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DataExport;
