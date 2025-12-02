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
import { Megaphone, Plus, Edit, Trash2, ArrowLeft, Eye, MousePointer } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';

type AdPlacement = 'dashboard' | 'activity' | 'feed' | 'news' | 'global';

interface Advertisement {
  id: string;
  title: string;
  title_es: string | null;
  description: string | null;
  description_es: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: AdPlacement;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  click_count: number | null;
  impression_count: number | null;
}

const AdminAdvertisements = () => {
  const { t } = useTranslation(['ads', 'common']);
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_es: '',
    description: '',
    description_es: '',
    image_url: '',
    link_url: '',
    placement: 'dashboard' as AdPlacement,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const { data: ads, isLoading } = useQuery({
    queryKey: ['admin-advertisements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Advertisement[];
    },
    enabled: isAdmin,
  });

  const addAd = useMutation({
    mutationFn: async (ad: Omit<Advertisement, 'id' | 'click_count' | 'impression_count'>) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert([ad])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      toast.success(t('ads:admin.ad_added'));
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const updateAd = useMutation({
    mutationFn: async ({ id, ...ad }: Advertisement) => {
      const { data, error } = await supabase
        .from('advertisements')
        .update(ad)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      toast.success(t('ads:admin.ad_updated'));
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      toast.success(t('ads:admin.ad_deleted'));
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      title_es: '',
      description: '',
      description_es: '',
      image_url: '',
      link_url: '',
      placement: 'dashboard',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingAd(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adData = {
      title: formData.title,
      title_es: formData.title_es || null,
      description: formData.description || null,
      description_es: formData.description_es || null,
      image_url: formData.image_url || null,
      link_url: formData.link_url || null,
      placement: formData.placement,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    if (editingAd) {
      updateAd.mutate({ ...adData, id: editingAd.id, click_count: editingAd.click_count, impression_count: editingAd.impression_count });
    } else {
      addAd.mutate(adData as any);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      title_es: ad.title_es || '',
      description: ad.description || '',
      description_es: ad.description_es || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      placement: ad.placement,
      start_date: ad.start_date ? format(new Date(ad.start_date), 'yyyy-MM-dd') : '',
      end_date: ad.end_date ? format(new Date(ad.end_date), 'yyyy-MM-dd') : '',
      is_active: ad.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('ads:admin.confirm_delete'))) {
      deleteAd.mutate(id);
    }
  };

  if (adminLoading) {
    return <div className="p-6"><Skeleton className="h-96" /></div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <SEOHead titleKey="admin.manage_ads" namespace="ads" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/vip">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Megaphone className="h-8 w-8 text-primary" />
                {t('ads:admin.manage_ads')}
              </h1>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('ads:admin.add_ad')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? t('ads:admin.edit_ad') : t('ads:admin.add_ad')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{t('ads:admin.title')}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t('ads:admin.title_es')}</Label>
                  <Input
                    value={formData.title_es}
                    onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('ads:admin.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>{t('ads:admin.description_es')}</Label>
                  <Textarea
                    value={formData.description_es}
                    onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>{t('ads:admin.image_url')}</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>{t('ads:admin.link_url')}</Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>{t('ads:admin.placement')}</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(value: AdPlacement) => 
                      setFormData({ ...formData, placement: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">{t('ads:admin.placements.dashboard')}</SelectItem>
                      <SelectItem value="activity">{t('ads:admin.placements.activity')}</SelectItem>
                      <SelectItem value="feed">{t('ads:admin.placements.feed')}</SelectItem>
                      <SelectItem value="news">{t('ads:admin.placements.news')}</SelectItem>
                      <SelectItem value="global">{t('ads:admin.placements.global')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('ads:admin.start_date')}</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t('ads:admin.end_date')}</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{t('ads:admin.is_active')}</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingAd ? t('common:save') : t('ads:admin.add_ad')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : ads && ads.length > 0 ? (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {ad.image_url && (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? t('common:active') : t('common:inactive')}
                        </Badge>
                        <Badge variant="outline">{t(`ads:admin.placements.${ad.placement}`)}</Badge>
                      </div>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.impression_count || 0} {t('ads:admin.impressions')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-4 w-4" />
                          {ad.click_count || 0} {t('ads:admin.clicks')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('common:no_data')}</h3>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('ads:admin.add_ad')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAdvertisements;
