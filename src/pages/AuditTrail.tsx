import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowLeft, Clock, AlertTriangle, Info, CheckCircle, XCircle, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SecurityLog {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  severity: string;
  created_at: string;
}

const AuditTrail = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchSecurityLogs();
  }, [filter]);

  const fetchSecurityLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('security_logs')
        .select('id, event_type, event_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Derive severity from event_type
      const logsWithSeverity = (data || []).map(log => {
        const eventType = log.event_type || '';
        let severity = 'low';
        if (eventType.includes('failed') || eventType.includes('error')) severity = 'high';
        else if (eventType.includes('warning') || eventType.includes('unusual')) severity = 'medium';
        else if (eventType.includes('critical') || eventType.includes('breach')) severity = 'critical';
        
        return {
          ...log,
          severity,
          event_data: (log.event_data as Record<string, unknown>) || {}
        };
      });
      
      const filteredData = filter === 'all' 
        ? logsWithSeverity 
        : logsWithSeverity.filter(log => log.severity === filter);
      
      setLogs(filteredData);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('audit_trail')}</h1>
            <p className="text-muted-foreground">{t('view_security_activity')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('common:filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_events')}</SelectItem>
            <SelectItem value="low">{t('low_severity')}</SelectItem>
            <SelectItem value="medium">{t('medium_severity')}</SelectItem>
            <SelectItem value="high">{t('high_severity')}</SelectItem>
            <SelectItem value="critical">{t('critical_severity')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('no_security_events')}</h3>
          <p className="text-muted-foreground">{t('no_security_events_desc')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {getSeverityIcon(log.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{formatEventType(log.event_type)}</span>
                    <Badge variant="outline" className={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  {log.event_data && Object.keys(log.event_data).length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                      {Object.entries(log.event_data).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
