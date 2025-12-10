import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, DollarSign, FileText, Loader2, Key, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProfessionalClient, ProfessionalFormData } from './types';
import { InviteCodeManager } from './InviteCodeManager';
import { PendingRequests } from './PendingRequests';

interface ApprovedDashboardProps {
  clients: ProfessionalClient[];
  formData: ProfessionalFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfessionalFormData>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  clientLabel?: string;
  professionalType?: 'coach' | 'clinician';
}

export const ApprovedDashboard = ({
  clients,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  clientLabel = 'Client',
  professionalType = 'coach',
}: ApprovedDashboardProps) => {
  const { t } = useTranslation(['professional', 'common']);

  return (
    <Tabs defaultValue="clients" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="clients">
          <Users className="w-4 h-4 mr-2" />
          {t('my_clients')}
        </TabsTrigger>
        <TabsTrigger value="invites">
          <Key className="w-4 h-4 mr-2" />
          {t('invite_codes')}
        </TabsTrigger>
        <TabsTrigger value="requests">
          <UserPlus className="w-4 h-4 mr-2" />
          {t('pending_requests')}
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
            <CardDescription>{clients.length} {clientLabel}s</CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t('no_clients')}</p>
            ) : (
              <div className="space-y-4">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.profiles?.full_name || clientLabel}</p>
                      <p className="text-sm text-muted-foreground">
                        Since {new Date(client.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">{t('view_client')}</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invites">
        <InviteCodeManager professionalType={professionalType} />
      </TabsContent>

      <TabsContent value="requests">
        <PendingRequests />
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
            <form onSubmit={onSubmit} className="space-y-4">
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
  );
};
