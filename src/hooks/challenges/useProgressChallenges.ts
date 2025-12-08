import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import type { Challenge, ChallengeFormData } from '@/components/challenges/types';
import { initialChallengeFormData } from '@/components/challenges/types';

export function useProgressChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ChallengeFormData>(initialChallengeFormData);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(['challenges', 'common']);

  useEffect(() => {
    fetchChallenges();
    
    const channel = supabase
      .channel('progress-challenges')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_challenges'
      }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data: challengesData, error } = await supabase
        .from('custom_challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const challengesWithCounts = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
            .eq('status', 'active');

          return { ...challenge, participants_count: count || 0 };
        })
      );

      setChallenges(challengesWithCounts);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: t('challenges:error'),
        description: t('challenges:failed_to_load'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('custom_challenges')
        .insert([{
          ...formData,
          creator_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('challenges:success'),
        description: t('challenges:challenge_created'),
      });

      setShowCreateForm(false);
      setFormData(initialChallengeFormData);

      if (data) {
        navigate(`/progress-challenge/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: t('challenges:error'),
        description: t('challenges:failed_to_create'),
        variant: "destructive",
      });
    }
  };

  return {
    challenges,
    loading,
    showCreateForm,
    setShowCreateForm,
    formData,
    setFormData,
    createChallenge,
  };
}
