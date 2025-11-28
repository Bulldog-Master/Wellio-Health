import { useState, useCallback } from 'react';

/**
 * Hook for optimistic UI updates
 * Updates UI immediately while waiting for server response
 */
export const useOptimisticUpdate = <T>(initialData: T[]) => {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);

  const addOptimistic = useCallback((newItem: T) => {
    setOptimisticData(prev => [newItem, ...prev]);
  }, []);

  const removeOptimistic = useCallback((predicate: (item: T) => boolean) => {
    setOptimisticData(prev => prev.filter(item => !predicate(item)));
  }, []);

  const updateOptimistic = useCallback((predicate: (item: T) => boolean, updates: Partial<T>) => {
    setOptimisticData(prev => 
      prev.map(item => predicate(item) ? { ...item, ...updates } : item)
    );
  }, []);

  const confirmUpdate = useCallback((serverData: T[]) => {
    setData(serverData);
    setOptimisticData(serverData);
  }, []);

  const rollback = useCallback(() => {
    setOptimisticData(data);
  }, [data]);

  return {
    data: optimisticData,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
    confirmUpdate,
    rollback
  };
};
