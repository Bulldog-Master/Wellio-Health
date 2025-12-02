import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Crown, UserPlus, Trash2, Shield, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';

interface VIPPassWithProfile {
  id: string;
  user_id: string;
  reason: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const AdminVIP = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  
  const [vipPasses, setVipPasses] = useState<VIPPassWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [userEmail, setUserEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error(t('admin:access_denied'));
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate, t]);

  useEffect(() => {
    if (isAdmin) {
      fetchVIPPasses();
    }
  }, [isAdmin]);

  const fetchVIPPasses = async () => {
    try {
      const { data, error } = await supabase
        .from('vip_passes')
        .select(`
          id,
          user_id,
          reason,
          expires_at,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile info for each VIP pass
      const passesWithProfiles: VIPPassWithProfile[] = [];
      for (const pass of data || []) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', pass.user_id)
          .single();
        
        passesWithProfiles.push({
          ...pass,
          profiles: profileData
        } as VIPPassWithProfile);
      }
      
      setVipPasses(passesWithProfiles);
    } catch (error) {
      console.error('Error fetching VIP passes:', error);
      toast.error(t('admin:fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGrantVIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      toast.error(t('admin:email_required'));
      return;
    }

    setSubmitting(true);
    try {
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', userEmail.trim())
        .single();

      if (userError || !userData) {
        // Try finding by searching profiles with email-like username
        toast.error(t('admin:user_not_found'));
        setSubmitting(false);
        return;
      }

      // Grant VIP pass using the secure function
      const { error } = await supabase.rpc('grant_vip_pass', {
        _user_id: userData.id,
        _reason: reason || null,
        _expires_at: isPermanent ? null : (expiresAt || null)
      });

      if (error) throw error;

      toast.success(t('admin:vip_granted'));
      setUserEmail('');
      setReason('');
      setIsPermanent(true);
      setExpiresAt('');
      fetchVIPPasses();
    } catch (error: any) {
      console.error('Error granting VIP:', error);
      toast.error(error.message || t('admin:grant_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeVIP = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('revoke_vip_pass', {
        _user_id: userId
      });

      if (error) throw error;

      toast.success(t('admin:vip_revoked'));
      fetchVIPPasses();
    } catch (error: any) {
      console.error('Error revoking VIP:', error);
      toast.error(error.message || t('admin:revoke_error'));
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">{t('admin:vip_management')}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{t('admin:vip_management_desc')}</p>
        </div>
      </div>

      {/* Grant VIP Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          {t('admin:grant_vip')}
        </h2>
        <form onSubmit={handleGrantVIP} className="space-y-4">
          <div>
            <Label>{t('admin:username_label')}</Label>
            <div className="mt-1">
              <UserSearchCombobox
                value={userEmail}
                onChange={setUserEmail}
                placeholder={t('admin:username_placeholder')}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="reason">{t('admin:reason_label')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin:reason_placeholder')}
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="permanent"
              checked={isPermanent}
              onCheckedChange={setIsPermanent}
            />
            <Label htmlFor="permanent">{t('admin:permanent_access')}</Label>
          </div>

          {!isPermanent && (
            <div>
              <Label htmlFor="expiresAt">{t('admin:expires_at')}</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Crown className="w-4 h-4 mr-2" />
            )}
            {t('admin:grant_vip_button')}
          </Button>
        </form>
      </Card>

      {/* Active VIP Passes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          {t('admin:active_vip_passes')}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : vipPasses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('admin:no_vip_passes')}
          </p>
        ) : (
          <div className="space-y-3">
            {vipPasses.map((pass) => (
              <div
                key={pass.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {pass.profiles?.full_name || pass.profiles?.username || t('admin:unknown_user')}
                    </p>
                    {pass.profiles?.username && (
                      <p className="text-sm text-muted-foreground">@{pass.profiles.username}</p>
                    )}
                    {pass.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{pass.reason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant={pass.is_active ? 'default' : 'secondary'}>
                      {pass.is_active ? t('admin:active') : t('admin:inactive')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pass.expires_at 
                        ? t('admin:expires', { date: format(new Date(pass.expires_at), 'PPP') })
                        : t('admin:permanent')
                      }
                    </p>
                  </div>
                  {pass.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeVIP(pass.user_id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminVIP;
