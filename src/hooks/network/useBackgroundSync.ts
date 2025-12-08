import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { processSyncQueue, queueSyncAction, registerBackgroundSync } from '@/lib/backgroundSync';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage background sync for offline actions
 */
export const useBackgroundSync = () => {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      // Process queued actions when coming back online
      processSyncQueue(async (action) => {
        try {
          switch (action.type) {
            case 'post':
              if (action.action === 'create') {
                await supabase.from('posts').insert(action.data);
              } else if (action.action === 'update') {
                await supabase.from('posts').update(action.data).eq('id', action.data.id);
              } else if (action.action === 'delete') {
                await supabase.from('posts').delete().eq('id', action.data.id);
              }
              break;
            
            case 'workout':
              if (action.action === 'create') {
                await supabase.from('activity_logs').insert(action.data);
              }
              break;
            
            case 'nutrition':
              if (action.action === 'create') {
                await supabase.from('nutrition_logs').insert(action.data);
              }
              break;
            
            case 'habit':
              if (action.action === 'create') {
                await supabase.from('habit_completions').insert(action.data);
              }
              break;
          }
          return true;
        } catch (error) {
          console.error('Sync action failed:', error);
          return false;
        }
      });
    }
  }, [isOnline]);

  useEffect(() => {
    // Register background sync on mount
    registerBackgroundSync('fitness-sync');
  }, []);

  return { queueSyncAction };
};
