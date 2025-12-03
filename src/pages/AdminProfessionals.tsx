import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, Clock, Dumbbell, Stethoscope, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

interface Application {
  id: string;
  user_id: string;
  professional_type: 'trainer' | 'practitioner';
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  years_experience: number | null;
  hourly_rate: number | null;
  location: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

const AdminProfessionals = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'professional', 'common']);
  const { isAdmin } = useSubscription();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (app: Application) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('professional_applications')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', app.id);

      if (error) throw error;

      setApplications(prev => prev.map(a => 
        a.id === app.id ? { ...a, status: 'approved' } : a
      ));
      toast.success('Application Approved', {
        description: `${app.full_name} has been approved as a ${app.professional_type}`
      });
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('professional_applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      setApplications(prev => prev.map(a => 
        a.id === selectedApp.id ? { ...a, status: 'rejected', rejection_reason: rejectionReason } : a
      ));
      toast.success('Application Rejected', {
        description: `${selectedApp.full_name}'s application has been rejected`
      });
      setShowRejectDialog(false);
      setSelectedApp(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filterByType = (type: 'trainer' | 'practitioner' | 'all') => {
    if (type === 'all') return applications;
    return applications.filter(a => a.professional_type === type);
  };

  const filterByStatus = (apps: Application[], status: string) => {
    if (status === 'all') return apps;
    return apps.filter(a => a.status === status);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/vip')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Professional Applications</h1>
          <p className="text-muted-foreground">
            Review and manage trainer/practitioner applications
            {pendingCount > 0 && <Badge className="ml-2" variant="secondary">{pendingCount} pending</Badge>}
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({applications.filter(a => a.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({applications.filter(a => a.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected', 'all'].map(status => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              {filterByStatus(applications, status).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No {status === 'all' ? '' : status} applications
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(applications, status).map(app => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            app.professional_type === 'trainer' 
                              ? 'bg-orange-500/20' 
                              : 'bg-cyan-500/20'
                          }`}>
                            {app.professional_type === 'trainer' 
                              ? <Dumbbell className="w-5 h-5 text-orange-500" />
                              : <Stethoscope className="w-5 h-5 text-cyan-500" />
                            }
                          </div>
                          <div>
                            <CardTitle className="text-lg">{app.full_name}</CardTitle>
                            <CardDescription>
                              {app.professional_type === 'trainer' ? 'Trainer' : 'Practitioner'} • {app.email}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{app.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Experience</p>
                          <p className="font-medium">{app.years_experience ? `${app.years_experience} years` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Hourly Rate</p>
                          <p className="font-medium">{app.hourly_rate ? `$${app.hourly_rate}/hr` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Applied</p>
                          <p className="font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {app.bio && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Bio</p>
                          <p className="text-sm">{app.bio}</p>
                        </div>
                      )}

                      {app.specialties && app.specialties.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                          <div className="flex flex-wrap gap-2">
                            {app.specialties.map((s, i) => (
                              <Badge key={i} variant="outline">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {app.certifications && app.certifications.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                          <div className="flex flex-wrap gap-2">
                            {app.certifications.map((c, i) => (
                              <Badge key={i} variant="secondary">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {app.rejection_reason && (
                        <div className="p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">Rejection Reason</p>
                          <p className="text-sm text-destructive">{app.rejection_reason}</p>
                        </div>
                      )}

                      {app.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={() => handleApprove(app)} 
                            disabled={processing}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectDialog(true);
                            }}
                            disabled={processing}
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <FileText className="w-4 h-4" />
                            View Documents
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedApp?.full_name}'s application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfessionals;
