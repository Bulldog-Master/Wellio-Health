import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { Advertisement, AdFormData, AdPlacement } from '@/components/admin/advertisements/types';

const initialFormData: AdFormData = {
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
};

export function useAdvertisements(isAdmin: boolean) {
  const { t } = useTranslation(['ads', 'common']);
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdFormData>(initialFormData);

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
    setFormData(initialFormData);
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
      updateAd.mutate({ 
        ...adData, 
        id: editingAd.id, 
        click_count: editingAd.click_count, 
        impression_count: editingAd.impression_count 
      });
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

  return {
    ads,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    editingAd,
    formData,
    setFormData,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}
