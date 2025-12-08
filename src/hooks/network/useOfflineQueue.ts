import { useState, useEffect, useCallback } from "react";

interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  description: string;
}

/**
 * Hook to queue actions when offline and retry when back online
 */
export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addToQueue = useCallback((action: () => Promise<void>, description: string) => {
    const queuedAction: QueuedAction = {
      id: crypto.randomUUID(),
      action,
      description,
    };
    
    setQueue(prev => [...prev, queuedAction]);
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem("offline-queue");
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem("offline-queue", JSON.stringify([...existing, { id: queuedAction.id, description }]));
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline || processing || queue.length === 0) return;
    
    setProcessing(true);
    
    for (const item of queue) {
      try {
        await item.action();
        setQueue(prev => prev.filter(i => i.id !== item.id));
        
        // Remove from localStorage
        const stored = localStorage.getItem("offline-queue");
        if (stored) {
          const existing = JSON.parse(stored);
          localStorage.setItem("offline-queue", JSON.stringify(existing.filter((i: any) => i.id !== item.id)));
        }
      } catch (error) {
        console.error("Failed to process queued action:", item.description, error);
      }
    }
    
    setProcessing(false);
  }, [isOnline, processing, queue]);

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  return {
    addToQueue,
    queueLength: queue.length,
    processing,
  };
};
