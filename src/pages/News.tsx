import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Newspaper, Trophy, Dumbbell, Bike, Footprints, Waves, Mountain, Heart, Swords, Globe, Flame, Medal, Timer, Calendar, ChevronDown, ChevronUp, ExternalLink, Plus, Pencil, Trash2, X, Check, Zap, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import SEOHead from "@/components/SEOHead";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  title_es: string | null;
  url: string;
  event_date: string | null;
  event_date_es: string | null;
  badge_type: string | null;
  sort_order: number;
  is_active: boolean;
}

const News = () => {
  const { t, i18n } = useTranslation(['common', 'news']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminStatus();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('latest');
  
  const [formData, setFormData] = useState({
    title: '',
    title_es: '',
    url: '',
    event_date: '',
    event_date_es: '',
    badge_type: 'upcoming',
    category: 'latest'
  });

  const isSpanish = i18n.language?.startsWith('es');

  const { data: newsItems = [], isLoading } = useQuery({
    queryKey: ['news-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as NewsItem[];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newItem: Omit<NewsItem, 'id' | 'is_active' | 'sort_order'>) => {
      const { data, error } = await supabase
        .from('news_items')
        .insert([{ ...newItem, sort_order: 0 }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-items'] });
      toast.success(t('common:saved'));
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('common:error'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (item: NewsItem) => {
      const { data, error } = await supabase
        .from('news_items')
        .update({
          title: item.title,
          title_es: item.title_es,
          url: item.url,
          event_date: item.event_date,
          event_date_es: item.event_date_es,
          badge_type: item.badge_type,
          category: item.category
        })
        .eq('id', item.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-items'] });
      toast.success(t('common:saved'));
      setEditingItem(null);
    },
    onError: () => {
      toast.error(t('common:error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-items'] });
      toast.success(t('common:deleted'));
    },
    onError: () => {
      toast.error(t('common:error'));
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      title_es: '',
      url: '',
      event_date: '',
      event_date_es: '',
      badge_type: 'upcoming',
      category: 'latest'
    });
  };

  const handleAddSubmit = () => {
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }
    addMutation.mutate({
      title: formData.title,
      title_es: formData.title_es || null,
      url: formData.url,
      event_date: formData.event_date || null,
      event_date_es: formData.event_date_es || null,
      badge_type: formData.badge_type,
      category: formData.category
    });
  };

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const newsCategories = [
    { id: 'latest', icon: Newspaper, titleKey: 'news:categories.latest_news', descKey: 'news:categories.latest_news_desc', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'biohacker', icon: Zap, titleKey: 'news:categories.biohacker', descKey: 'news:categories.biohacker_desc', color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
    { id: 'bodybuilding', icon: Trophy, titleKey: 'news:categories.bodybuilding', descKey: 'news:categories.bodybuilding_desc', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { id: 'crossfit', icon: Dumbbell, titleKey: 'news:categories.crossfit', descKey: 'news:categories.crossfit_desc', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { id: 'cycling', icon: Bike, titleKey: 'news:categories.cycling', descKey: 'news:categories.cycling_desc', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { id: 'global', icon: Globe, titleKey: 'news:categories.global_events', descKey: 'news:categories.global_events_desc', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { id: 'marathons', icon: Footprints, titleKey: 'news:categories.marathons', descKey: 'news:categories.marathons_desc', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { id: 'medical', icon: Stethoscope, titleKey: 'news:categories.medical', descKey: 'news:categories.medical_desc', color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
    { id: 'mma', icon: Swords, titleKey: 'news:categories.mma', descKey: 'news:categories.mma_desc', color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'obstacle', icon: Mountain, titleKey: 'news:categories.obstacle_racing', descKey: 'news:categories.obstacle_racing_desc', color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
    { id: 'swimming', icon: Waves, titleKey: 'news:categories.swimming', descKey: 'news:categories.swimming_desc', color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
    { id: 'triathlons', icon: Medal, titleKey: 'news:categories.triathlons', descKey: 'news:categories.triathlons_desc', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
    { id: 'ultra', icon: Flame, titleKey: 'news:categories.ultra_endurance', descKey: 'news:categories.ultra_endurance_desc', color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
    { id: 'yoga', icon: Heart, titleKey: 'news:categories.yoga_wellness', descKey: 'news:categories.yoga_wellness_desc', color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  ];

  const getBadgeVariant = (type: string | null) => {
    switch (type) {
      case 'live': return 'destructive';
      case 'upcoming': return 'default';
      default: return 'secondary';
    }
  };

  const getBadgeText = (type: string | null) => {
    switch (type) {
      case 'live': return t('news:live');
      case 'upcoming': return t('news:upcoming');
      default: return t('news:recent');
    }
  };

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getItemsByCategory = (categoryId: string) => {
    return newsItems.filter(item => item.category === categoryId);
  };

  const getCategoryBadgeType = (categoryId: string) => {
    const items = getItemsByCategory(categoryId);
    if (items.some(i => i.badge_type === 'live')) return 'live';
    if (items.some(i => i.badge_type === 'upcoming')) return 'upcoming';
    return 'recent';
  };

  return (
    <>
      <SEOHead titleKey="page_title" descriptionKey="page_description" namespace="news" />
      <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} aria-label={t('common:back')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{t('news:title')}</h1>
                <p className="text-muted-foreground">{t('news:subtitle')}</p>
              </div>
            </div>
            
            {isAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('common:add')}
              </Button>
            )}
          </div>

          {/* Global Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              {t('news:global_coverage')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Timer className="h-3 w-3" />
              {t('news:updated_daily')}
            </Badge>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {newsCategories.map((category) => {
              const Icon = category.icon;
              const isOpen = openCategories.includes(category.id);
              const categoryItems = getItemsByCategory(category.id);
              
              return (
                <Collapsible key={category.id} open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
                  <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer pb-2">
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center hover:scale-110 transition-transform`}>
                            <Icon className={`h-6 w-6 ${category.color}`} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(getCategoryBadgeType(category.id))} className="text-xs">
                              {getBadgeText(getCategoryBadgeType(category.id))}
                            </Badge>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-3">{t(category.titleKey)}</CardTitle>
                        <CardDescription className="line-clamp-2">{t(category.descKey)}</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="space-y-2 pt-0">
                        <div className="space-y-2 border-t pt-3">
                          {categoryItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              {t('common:no_data')}
                            </p>
                          ) : (
                            categoryItems.map((item) => (
                              <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                <button onClick={() => handleNewsClick(item.url)} className="flex-1 flex items-start gap-2 text-left">
                                  <Calendar className={`h-4 w-4 mt-0.5 ${category.color} flex-shrink-0`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                      {isSpanish && item.title_es ? item.title_es : item.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {isSpanish && item.event_date_es ? item.event_date_es : item.event_date}
                                    </p>
                                  </div>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                                </button>
                                
                                {isAdmin && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingItem(item)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: category.id }));
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to {t(category.titleKey)}
                          </Button>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* Coming Soon Notice */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-8 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('news:coming_soon_title')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">{t('news:coming_soon_desc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add News Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add News Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {newsCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{t(cat.titleKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title (English)</Label>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div>
              <Label>Title (Spanish)</Label>
              <Input value={formData.title_es} onChange={(e) => setFormData(prev => ({ ...prev, title_es: e.target.value }))} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={formData.url} onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Date (English)</Label>
                <Input value={formData.event_date} onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))} placeholder="Jan 1, 2025" />
              </div>
              <div>
                <Label>Date (Spanish)</Label>
                <Input value={formData.event_date_es} onChange={(e) => setFormData(prev => ({ ...prev, event_date_es: e.target.value }))} placeholder="1 Ene 2025" />
              </div>
            </div>
            <div>
              <Label>Badge Type</Label>
              <Select value={formData.badge_type} onValueChange={(v) => setFormData(prev => ({ ...prev, badge_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">{t('news:upcoming')}</SelectItem>
                  <SelectItem value="recent">{t('news:recent')}</SelectItem>
                  <SelectItem value="live">{t('news:live')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit News Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit News Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={editingItem.category} onValueChange={(v) => setEditingItem({ ...editingItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {newsCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{t(cat.titleKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title (English)</Label>
                <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
              </div>
              <div>
                <Label>Title (Spanish)</Label>
                <Input value={editingItem.title_es || ''} onChange={(e) => setEditingItem({ ...editingItem, title_es: e.target.value })} />
              </div>
              <div>
                <Label>URL</Label>
                <Input value={editingItem.url} onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Date (English)</Label>
                  <Input value={editingItem.event_date || ''} onChange={(e) => setEditingItem({ ...editingItem, event_date: e.target.value })} />
                </div>
                <div>
                  <Label>Date (Spanish)</Label>
                  <Input value={editingItem.event_date_es || ''} onChange={(e) => setEditingItem({ ...editingItem, event_date_es: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Badge Type</Label>
                <Select value={editingItem.badge_type || 'upcoming'} onValueChange={(v) => setEditingItem({ ...editingItem, badge_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">{t('news:upcoming')}</SelectItem>
                    <SelectItem value="recent">{t('news:recent')}</SelectItem>
                    <SelectItem value="live">{t('news:live')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={() => editingItem && updateMutation.mutate(editingItem)} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default News;
