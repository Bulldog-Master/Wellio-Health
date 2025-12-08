import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMedicalAuth = () => {
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const checkSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasValidSession(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('medical_access_sessions')
        .select('expires_at')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setHasValidSession(true);
        setExpiresAt(new Date(data.expires_at));
      } else {
        setHasValidSession(false);
        setExpiresAt(null);
      }
    } catch (err) {
      console.error('Error checking medical session:', err);
      setHasValidSession(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { success: false, error: 'User not found' };
      }

      // Re-authenticate with password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        return { success: false, error: 'Invalid password' };
      }

      // Create medical access session
      const { error: sessionError } = await supabase.rpc('create_medical_session', {
        _user_id: user.id,
      });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return { success: false, error: 'Failed to create session' };
      }

      await checkSession();
      return { success: true };
    } catch (err) {
      console.error('Authentication error:', err);
      return { success: false, error: 'Authentication failed' };
    }
  };

  useEffect(() => {
    checkSession();
    
    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    hasValidSession,
    isLoading,
    expiresAt,
    authenticate,
    refreshSession: checkSession,
  };
};
