/**
 * Background sync utilities for offline-first PWA functionality
 * Queues actions when offline and syncs when connection restored
 */

interface SyncAction {
  id: string;
  type: 'post' | 'workout' | 'nutrition' | 'habit';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'fitness_sync_queue';

export const queueSyncAction = (action: Omit<SyncAction, 'id' | 'timestamp'>) => {
  const queue = getSyncQueue();
  const newAction: SyncAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  };
  
  queue.push(newAction);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  
  return newAction.id;
};

export const getSyncQueue = (): SyncAction[] => {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
};

export const clearSyncQueue = () => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

export const removeSyncAction = (id: string) => {
  const queue = getSyncQueue().filter(action => action.id !== id);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export const processSyncQueue = async (
  processor: (action: SyncAction) => Promise<boolean>
) => {
  const queue = getSyncQueue();
  const results = await Promise.allSettled(
    queue.map(async (action) => {
      const success = await processor(action);
      if (success) {
        removeSyncAction(action.id);
      }
      return { action, success };
    })
  );
  
  return results;
};

// Register background sync if supported
export const registerBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype as any)) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};
