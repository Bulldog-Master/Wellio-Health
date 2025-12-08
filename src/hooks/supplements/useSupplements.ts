import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Supplement, SupplementFormData, PopularSupplement, initialFormData } from "@/components/supplements/types";

export const useSupplements = () => {
  const { t } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplement, setSelectedSupplement] = useState<PopularSupplement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SupplementFormData>(initialFormData);

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupplements(data || []);
    } catch (error) {
      console.error('Error fetching supplements:', error);
      toast({
        title: tCommon('error'),
        description: t('failed_to_load_supplements'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopularClick = (supplement: PopularSupplement) => {
    setSelectedSupplement(supplement);
    setFormData({
      name: supplement.name,
      description: supplement.description,
      category: supplement.category,
      dosage: "",
      frequency: "",
      product_link: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleCustomAdd = () => {
    setSelectedSupplement(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: t('name_required'),
        description: t('name_required_error'),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('authentication_required'),
          description: t('login_to_save'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('supplements')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          dosage: formData.dosage || null,
          frequency: formData.frequency || null,
          product_link: formData.product_link || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: tCommon('success'),
        description: t('supplement_added'),
      });

      setIsDialogOpen(false);
      fetchSupplements();
    } catch (error) {
      console.error('Error saving supplement:', error);
      toast({
        title: tCommon('error'),
        description: t('failed_to_save_supplement'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('supplements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: tCommon('deleted'),
        description: t('supplement_deleted'),
      });

      fetchSupplements();
    } catch (error) {
      console.error('Error deleting supplement:', error);
      toast({
        title: tCommon('error'),
        description: t('failed_to_delete_supplement'),
        variant: "destructive",
      });
    }
  };

  return {
    supplements,
    isLoading,
    selectedSupplement,
    isDialogOpen,
    setIsDialogOpen,
    isSaving,
    formData,
    setFormData,
    handlePopularClick,
    handleCustomAdd,
    handleSave,
    handleDelete,
  };
};
