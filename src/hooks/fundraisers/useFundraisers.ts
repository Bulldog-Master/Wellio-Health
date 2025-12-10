import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Fundraiser, FundraiserFormData, defaultFormData } from '@/components/fundraisers/types';
import { fundraiserSchema, validateAndSanitize } from '@/lib/validation';

export const useFundraisers = () => {
  const { t } = useTranslation('fundraisers');
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [filteredFundraisers, setFilteredFundraisers] = useState<Fundraiser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState<FundraiserFormData>(defaultFormData);

  const categories = [
    { value: 'Medical', label: t('categories.medical') },
    { value: 'Community Event', label: t('categories.community_event') },
    { value: 'Charity', label: t('categories.charity') },
    { value: 'Equipment', label: t('categories.equipment') },
    { value: 'Other', label: t('categories.other') },
  ];

  useEffect(() => {
    fetchFundraisers();
  }, []);

  useEffect(() => {
    filterFundraisers();
  }, [fundraisers, searchQuery, selectedCategory]);

  const filterFundraisers = () => {
    let filtered = [...fundraisers];

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }

    setFilteredFundraisers(filtered);
  };

  const fetchFundraisers = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFundraisers((data as any) || []);
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
      toast.error(t('messages.failed_to_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t('messages.sign_in_required'));
      return;
    }

    try {
      const validation = validateAndSanitize(fundraiserSchema, {
        title: formData.title,
        description: formData.description,
        goal_amount: parseFloat(formData.goal_amount),
        category: formData.category,
        location: formData.location || undefined,
        end_date: formData.end_date,
      });

      if (validation.success === false) {
        toast.error(validation.error);
        return;
      }

      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('fundraiser-images')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('fundraiser-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('fundraisers')
        .insert({
          user_id: user.id,
          ...validation.data,
          image_url: imageUrl
        });

      if (error) throw error;

      toast.success(t('messages.created_successfully'));
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      fetchFundraisers();
    } catch (error) {
      console.error('Error creating fundraiser:', error);
      toast.error(t('messages.failed_to_create'));
    }
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return {
    fundraisers,
    filteredFundraisers,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    formData,
    setFormData,
    categories,
    handleSubmit,
    getCategoryLabel,
  };
};
