import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/SEOHead';
import { Award, ExternalLink, Plus, Edit, Trash2, Crown, Medal, Trophy, Star, ArrowLeft, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';

type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  description_es: string | null;
  tier: SponsorTier;
  is_active: boolean;
  display_order: number;
}

const tierIcons = {
  platinum: Crown,
  gold: Trophy,
  silver: Medal,
  bronze: Star,
};

const tierColors = {
  platinum: 'bg-gradient-to-r from-slate-300 to-slate-100 text-slate-800',
  gold: 'bg-gradient-to-r from-yellow-400 to-amber-300 text-amber-900',
  silver: 'bg-gradient-to-r from-gray-300 to-gray-200 text-gray-800',
  bronze: 'bg-gradient-to-r from-orange-400 to-amber-600 text-orange-900',
};

const Sponsors = () => {
  const { t, i18n } = useTranslation(['sponsors', 'common']);
  const { isAdmin } = useAdminStatus();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    description: '',
    description_es: '',
    tier: 'bronze' as SponsorTier,
    display_order: 0,
    is_active: true,
  });

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('tier', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });

  const addSponsor = useMutation({
    mutationFn: async (sponsor: Omit<Sponsor, 'id'>) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert([sponsor])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success(t('sponsors:admin.sponsor_added'));
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const updateSponsor = useMutation({
    mutationFn: async ({ id, ...sponsor }: Sponsor) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(sponsor)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success(t('sponsors:admin.sponsor_updated'));
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const deleteSponsor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success(t('sponsors:admin.sponsor_deleted'));
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      description_es: '',
      tier: 'bronze',
      display_order: 0,
      is_active: true,
    });
    setEditingSponsor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSponsor) {
      updateSponsor.mutate({ ...formData, id: editingSponsor.id });
    } else {
      addSponsor.mutate(formData);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || '',
      description: sponsor.description || '',
      description_es: sponsor.description_es || '',
      tier: sponsor.tier,
      display_order: sponsor.display_order,
      is_active: sponsor.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('sponsors:admin.confirm_delete'))) {
      deleteSponsor.mutate(id);
    }
  };

  const getDescription = (sponsor: Sponsor) => {
    if (i18n.language?.startsWith('es') && sponsor.description_es) {
      return sponsor.description_es;
    }
    return sponsor.description;
  };

  // Group sponsors by tier
  const groupedSponsors = sponsors?.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = [];
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>) || {};

  const tierOrder: SponsorTier[] = ['platinum', 'gold', 'silver', 'bronze'];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <SEOHead
        titleKey="seo:sponsors.title"
        descriptionKey="seo:sponsors.description"
      />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Handshake className="h-8 w-8 text-primary" />
                {t('sponsors:title')}
              </h1>
              <p className="text-muted-foreground">{t('sponsors:subtitle')}</p>
            </div>
          </div>
          
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('sponsors:admin.add_sponsor')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSponsor ? t('sponsors:admin.edit_sponsor') : t('sponsors:admin.add_sponsor')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>{t('sponsors:admin.sponsor_name')}</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>{t('sponsors:admin.logo_url')}</Label>
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>{t('sponsors:admin.website_url')}</Label>
                    <Input
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>{t('sponsors:admin.description')}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>{t('sponsors:admin.description_es')}</Label>
                    <Textarea
                      value={formData.description_es}
                      onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>{t('sponsors:admin.tier')}</Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value: SponsorTier) => 
                        setFormData({ ...formData, tier: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platinum">{t('sponsors:tiers.platinum')}</SelectItem>
                        <SelectItem value="gold">{t('sponsors:tiers.gold')}</SelectItem>
                        <SelectItem value="silver">{t('sponsors:tiers.silver')}</SelectItem>
                        <SelectItem value="bronze">{t('sponsors:tiers.bronze')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('sponsors:admin.display_order')}</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>{t('sponsors:admin.is_active')}</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingSponsor ? t('common:save') : t('sponsors:admin.add_sponsor')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Sponsors by Tier */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : sponsors && sponsors.length > 0 ? (
          <div className="space-y-8">
            {tierOrder.map((tier) => {
              const tierSponsors = groupedSponsors[tier];
              if (!tierSponsors?.length) return null;
              
              const TierIcon = tierIcons[tier];
              
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-4">
                    <TierIcon className="h-6 w-6" />
                    <h2 className="text-xl font-semibold">{t(`sponsors:tiers.${tier}`)}</h2>
                    <Badge className={tierColors[tier]}>
                      {tierSponsors.length}
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tierSponsors.map((sponsor) => (
                      <Card key={sponsor.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {sponsor.logo_url ? (
                                <img
                                  src={sponsor.logo_url}
                                  alt={sponsor.name}
                                  className="h-12 w-12 object-contain rounded"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                  <Award className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                                <Badge className={`mt-1 ${tierColors[sponsor.tier]}`}>
                                  {t(`sponsors:tiers.${sponsor.tier}`)}
                                </Badge>
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(sponsor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(sponsor.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {getDescription(sponsor) && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {getDescription(sponsor)}
                            </p>
                          )}
                          {sponsor.website_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              asChild
                            >
                              <a
                                href={sponsor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t('sponsors:visit_website')}
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('sponsors:no_sponsors')}</h3>
              <p className="text-muted-foreground mb-4">{t('sponsors:become_sponsor_desc')}</p>
              <Button>{t('sponsors:contact_us')}</Button>
            </CardContent>
          </Card>
        )}

        {/* Become a Sponsor CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div>
              <h3 className="text-xl font-semibold">{t('sponsors:become_sponsor')}</h3>
              <p className="text-muted-foreground">{t('sponsors:become_sponsor_desc')}</p>
            </div>
            <Button size="lg">
              {t('sponsors:contact_us')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sponsors;
