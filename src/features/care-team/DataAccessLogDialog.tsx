import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, History, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AccessLogEntry {
  id: string;
  accessed_at: string;
  professional_id: string;
  access_type: string;
  role: string | null;
  context: Record<string, unknown> | null;
  professional_name?: string;
}

interface DataAccessLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DataAccessLogDialog = ({ open, onOpenChange }: DataAccessLogDialogProps) => {
  const { t } = useTranslation(['care_team', 'common']);
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('data_access_log')
        .select(`
          id,
          accessed_at,
          professional_id,
          access_type,
          role,
          context,
          profiles:professional_id (
            display_name
          )
        `)
        .eq('client_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedLogs = (data || []).map((log: any) => ({
        ...log,
        professional_name: log.profiles?.display_name || t('common:unknown'),
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching access logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string | null): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'coach': return 'default';
      case 'clinician': return 'secondary';
      default: return 'outline';
    }
  };

  const formatAccessType = (type: string): string => {
    // Map access types to readable labels
    const typeMap: Record<string, string> = {
      'fwi_view': 'FWI + trends',
      'trends_view': 'Trend overview',
      'adherence_view': 'Adherence overview',
      'profile_view': 'Profile summary',
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <DialogTitle>{t('data_access_history')}</DialogTitle>
          </div>
          <DialogDescription className="whitespace-pre-line text-sm">
            {t('access_log_explanation')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                {t('no_access_yet')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>{t('date')}</span>
                <span>{t('who')}</span>
                <span>{t('role')}</span>
                <span>{t('what_viewed')}</span>
              </div>

              {/* Log entries */}
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-4 gap-2 px-3 py-2 text-sm hover:bg-muted/50 rounded-lg"
                >
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(log.accessed_at), 'MMM d, HH:mm')}
                  </span>
                  <span className="truncate" title={log.professional_name}>
                    {log.professional_name}
                  </span>
                  <Badge variant={getRoleBadgeVariant(log.role)} className="text-xs w-fit">
                    {log.role === 'coach' ? t('trainers_coaches') : 
                     log.role === 'clinician' ? t('clinicians') : 
                     t('supporters')}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatAccessType(log.access_type)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground border-t pt-4">
          {t('access_log_footer')}
        </p>
      </DialogContent>
    </Dialog>
  );
};
