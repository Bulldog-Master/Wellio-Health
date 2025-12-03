import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Dumbbell, Users, Calendar, DollarSign, FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { SEOHead } from '@/components/SEOHead';

interface Application {
  id: string;
  status: string;
  full_name: string;
  bio: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  years_experience: number | null;
  hourly_rate: number | null;
  location: string | null;
}

interface Client {
  id: string;
  client_id: string;
  status: string;
  started_at: string;
  profiles?: { full_name: string; avatar_url: string | null };
}

const TrainerPortal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['professional', 'common']);
  const [application, setApplication] = useState<Application | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    specialties: '',
    certifications: '',
    years_experience: '',
    hourly_rate: '',
    location: '',
    website_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch application
      const { data: appData } = await supabase
        .from('professional_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('professional_type', 'trainer')
        .maybeSingle();

      if (appData) {
        setApplication(appData);
        setFormData({
          full_name: appData.full_name || '',
          email: appData.email || user.email || '',
          phone: appData.phone || '',
          bio: appData.bio || '',
          specialties: appData.specialties?.join(', ') || '',
          certifications: appData.certifications?.join(', ') || '',
          years_experience: appData.years_experience?.toString() || '',
          hourly_rate: appData.hourly_rate?.toString() || '',
          location: appData.location || '',
          website_url: appData.website_url || ''
        });

        // If approved, fetch clients
        if (appData.status === 'approved') {
          const { data: clientsData } = await supabase
            .from('professional_clients')
            .select('*')
            .eq('professional_id', user.id)
            .eq('professional_type', 'trainer');

          if (clientsData) {
            setClients(clientsData);
          }
        }
      } else {
        // Pre-fill email
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const applicationData = {
        user_id: user.id,
        professional_type: 'trainer' as const,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        bio: formData.bio || null,
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : null,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        location: formData.location || null,
        website_url: formData.website_url || null
      };

      const { data, error } = await supabase
        .from('professional_applications')
        .upsert(applicationData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setApplication(data);
      toast.success(t('application_submitted'), {
        description: t('application_submitted_desc')
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(t('common:error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('application_approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('application_rejected')}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('application_pending')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <SubscriptionGate feature="trainer_portal">
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8 px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:back')}
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('trainer_portal')}</h1>
              <p className="text-muted-foreground">{t('trainer_portal_desc')}</p>
            </div>
          </div>

          {application?.status === 'approved' ? (
            // Approved Trainer Dashboard
            <Tabs defaultValue="clients" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clients">
                  <Users className="w-4 h-4 mr-2" />
                  {t('my_clients')}
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('my_schedule')}
                </TabsTrigger>
                <TabsTrigger value="earnings">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t('my_earnings')}
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('profile_settings')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clients">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('my_clients')}</CardTitle>
                    <CardDescription>{clients.length} {t('common:clients')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clients.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('no_clients')}</p>
                    ) : (
                      <div className="space-y-4">
                        {clients.map(client => (
                          <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{client.profiles?.full_name || 'Client'}</p>
                              <p className="text-sm text-muted-foreground">Since {new Date(client.started_at).toLocaleDateString()}</p>
                            </div>
                            <Button variant="outline" size="sm">{t('view_client')}</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('my_schedule')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">{t('no_sessions')}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="earnings">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('my_earnings')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">{t('total_earned')}</p>
                        <p className="text-2xl font-bold">$0.00</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">{t('this_month')}</p>
                        <p className="text-2xl font-bold">$0.00</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">{t('pending_payout')}</p>
                        <p className="text-2xl font-bold">$0.00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile_settings')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{t('hourly_rate')}</Label>
                          <Input
                            type="number"
                            value={formData.hourly_rate}
                            onChange={e => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('location')}</Label>
                          <Input
                            value={formData.location}
                            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('bio')}</Label>
                        <Textarea
                          value={formData.bio}
                          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {t('update_profile')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Application Form
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('application_form')}</CardTitle>
                    <CardDescription>{t('application_desc')}</CardDescription>
                  </div>
                  {application && getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="font-semibold mb-4">{t('personal_info')}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('full_name')} *</Label>
                        <Input
                          required
                          value={formData.full_name}
                          onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('email')} *</Label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('phone')}</Label>
                        <Input
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('location')}</Label>
                        <Input
                          value={formData.location}
                          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div>
                    <h3 className="font-semibold mb-4">{t('professional_info')}</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('bio')}</Label>
                        <Textarea
                          value={formData.bio}
                          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder={t('bio_placeholder')}
                          rows={4}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{t('specialties')}</Label>
                          <Input
                            value={formData.specialties}
                            onChange={e => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                            placeholder={t('specialties_placeholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('certifications')}</Label>
                          <Input
                            value={formData.certifications}
                            onChange={e => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                            placeholder={t('certifications_placeholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('years_experience')}</Label>
                          <Input
                            type="number"
                            value={formData.years_experience}
                            onChange={e => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('hourly_rate')}</Label>
                          <Input
                            type="number"
                            value={formData.hourly_rate}
                            onChange={e => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || application?.status === 'pending'}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('submitting')}
                      </>
                    ) : application?.status === 'pending' ? (
                      t('application_pending')
                    ) : (
                      t('submit_application')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default TrainerPortal;
