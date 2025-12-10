import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardCheck, UserPlus, Clock, Check, X, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingRequest {
  id: string;
  professional_id: string;
  professional_type: 'coach' | 'clinician';
  created_at: string;
  professional: {
    display_name: string;
    avatar_url?: string;
  };
}

export const PendingRequests = () => {
  const { t } = useTranslation(['professional', 'privacy', 'common']);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('professional_relationship_requests')
        .select(`
          id,
          professional_id,
          professional_type,
          created_at,
          profiles:professional_id (
            display_name,
            avatar_url
          )
        `)
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests((data as any[])?.map(r => ({
        ...r,
        professional: r.profiles
      })) || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConsentText = (type: 'coach' | 'clinician', name: string) => {
    if (type === 'coach') {
      return t('professional:coach_consent_text', { name });
    }
    return t('professional:clinician_consent_text', { name });
  };

  const getDataSharingList = (type: 'coach' | 'clinician') => {
    if (type === 'coach') {
      return [
        t('privacy:can_see_functional_index'),
        t('privacy:can_see_workout_trends'),
        t('privacy:can_see_activity_summary')
      ];
    }
    return [
      t('privacy:can_see_functional_index'),
      t('privacy:can_see_wellness_trends'),
      t('privacy:can_see_recovery_summary')
    ];
  };

  const handleAccept = async () => {
    if (!selectedRequest || !consentChecked) return;
    
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const consentText = getConsentText(
        selectedRequest.professional_type, 
        selectedRequest.professional.display_name
      );

      // Update request status
      const { error: updateError } = await supabase
        .from('professional_relationship_requests')
        .update({
          status: 'accepted',
          consent_given_at: new Date().toISOString(),
          consent_text: consentText
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // Create the actual relationship
      const table = selectedRequest.professional_type === 'coach' 
        ? 'coach_clients' 
        : 'clinician_patients';
      
      const relationshipData = selectedRequest.professional_type === 'coach'
        ? { coach_id: selectedRequest.professional_id, client_id: user.id, status: 'active' }
        : { clinician_id: selectedRequest.professional_id, patient_id: user.id, status: 'active' };

      const { error: relationError } = await supabase
        .from(table)
        .insert(relationshipData);

      if (relationError) throw relationError;

      // Log the consent
      await supabase.from('security_logs').insert({
        user_id: user.id,
        event_type: 'professional_consent_given',
        event_data: {
          professional_id: selectedRequest.professional_id,
          professional_type: selectedRequest.professional_type,
          consent_text: consentText
        }
      });

      toast.success(t('professional:request_accepted'));
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
      setConsentChecked(false);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(t('professional:request_accept_failed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request: PendingRequest) => {
    try {
      const { error } = await supabase
        .from('professional_relationship_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) throw error;

      toast.success(t('professional:request_rejected'));
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return null; // Don't show card if no pending requests
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <CardTitle>{t('professional:pending_requests')}</CardTitle>
          </div>
          <CardDescription>
            {t('professional:pending_requests_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map(request => (
            <div 
              key={request.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={request.professional.avatar_url} />
                  <AvatarFallback>
                    {request.professional.display_name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.professional.display_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {request.professional_type === 'coach' 
                        ? t('professional:coach') 
                        : t('professional:clinician')}
                    </Badge>
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(request)}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('common:decline')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('common:review')}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <AlertDialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('professional:consent_required')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  {selectedRequest && getConsentText(
                    selectedRequest.professional_type,
                    selectedRequest.professional.display_name
                  )}
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-sm mb-2">
                    {t('professional:data_they_can_see')}:
                  </p>
                  <ul className="text-sm space-y-1">
                    {selectedRequest && getDataSharingList(selectedRequest.professional_type).map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="font-medium text-sm mb-2">
                    {t('professional:data_they_cannot_see')}:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <X className="h-3 w-3 text-red-500" />
                      {t('privacy:medical_records')}
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="h-3 w-3 text-red-500" />
                      {t('privacy:personal_messages')}
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="h-3 w-3 text-red-500" />
                      {t('privacy:payment_info')}
                    </li>
                  </ul>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="consent"
                    checked={consentChecked}
                    onCheckedChange={(checked) => setConsentChecked(!!checked)}
                  />
                  <label htmlFor="consent" className="text-sm cursor-pointer">
                    {t('professional:consent_checkbox_text')}
                  </label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConsentChecked(false)}>
              {t('common:cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              disabled={!consentChecked || processing}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {t('professional:accept_and_connect')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
