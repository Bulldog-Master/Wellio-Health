import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItemType = 'subscription' | 'addon' | 'product';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  name_es?: string;
  description?: string;
  description_es?: string;
  price: number;
  quantity: number;
  billingCycle?: 'monthly' | 'yearly';
  metadata?: Record<string, any>;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasItem: (id: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          // For subscriptions/addons, replace instead of increment
          if (item.type === 'subscription' || item.type === 'addon') {
            set({
              items: items.map(i =>
                i.id === item.id ? { ...i, ...item, quantity: 1 } : i
              )
            });
          } else {
            // For products, increment quantity
            set({
              items: items.map(i =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              )
            });
          }
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
        
        // Open cart when adding item
        set({ isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },

      hasItem: (id) => {
        return get().items.some(item => item.id === id);
      },
    }),
    {
      name: 'wellio-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen
    }
  )
);
