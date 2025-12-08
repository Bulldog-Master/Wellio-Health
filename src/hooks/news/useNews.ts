import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NewsItem, NewsFormData, defaultFormData } from '@/components/news/types';

export const useNews = () => {
  const { t, i18n } = useTranslation(['common', 'news']);
  const queryClient = useQueryClient();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<NewsFormData>(defaultFormData);

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
    setFormData(defaultFormData);
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

  const getItemsByCategory = (categoryId: string) => {
    return newsItems.filter(item => item.category === categoryId);
  };

  const getCategoryBadgeType = (categoryId: string) => {
    const items = getItemsByCategory(categoryId);
    if (items.some(i => i.badge_type === 'live')) return 'live';
    if (items.some(i => i.badge_type === 'upcoming')) return 'upcoming';
    return 'recent';
  };

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return {
    newsItems,
    isLoading,
    isSpanish,
    openCategories,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    addMutation,
    updateMutation,
    deleteMutation,
    resetForm,
    handleAddSubmit,
    toggleCategory,
    getItemsByCategory,
    getCategoryBadgeType,
    handleNewsClick,
    t
  };
};
