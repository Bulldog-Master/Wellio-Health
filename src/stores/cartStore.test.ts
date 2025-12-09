import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.setState({ items: [], isOpen: false });
  });

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      const { addItem, items } = useCartStore.getState();
      
      addItem({
        id: 'test-item-1',
        name: 'Test Product',
        price: 9.99,
        type: 'product',
      });
      
      const updatedItems = useCartStore.getState().items;
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].name).toBe('Test Product');
      expect(updatedItems[0].quantity).toBe(1);
    });

    it('should increment quantity for existing item', () => {
      const store = useCartStore.getState();
      
      store.addItem({
        id: 'test-item-1',
        name: 'Test Product',
        price: 9.99,
        type: 'product',
      });
      
      store.addItem({
        id: 'test-item-1',
        name: 'Test Product',
        price: 9.99,
        type: 'product',
      });
      
      const updatedItems = useCartStore.getState().items;
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].quantity).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const store = useCartStore.getState();
      
      store.addItem({
        id: 'test-item-1',
        name: 'Test Product',
        price: 9.99,
        type: 'product',
      });
      
      store.removeItem('test-item-1');
      
      const updatedItems = useCartStore.getState().items;
      expect(updatedItems).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const store = useCartStore.getState();
      
      store.addItem({ id: '1', name: 'Item 1', price: 10, type: 'product' });
      store.addItem({ id: '2', name: 'Item 2', price: 20, type: 'addon' });
      
      store.clearCart();
      
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should calculate correct total', () => {
      const store = useCartStore.getState();
      
      store.addItem({ id: '1', name: 'Item 1', price: 10, type: 'product' });
      store.addItem({ id: '2', name: 'Item 2', price: 25, type: 'addon' });
      store.addItem({ id: '1', name: 'Item 1', price: 10, type: 'product' }); // quantity: 2
      
      const total = useCartStore.getState().getTotalPrice();
      expect(total).toBe(45); // (10 * 2) + 25
    });
  });

  describe('toggleCart', () => {
    it('should toggle cart open state', () => {
      const store = useCartStore.getState();
      
      expect(store.isOpen).toBe(false);
      
      store.toggleCart();
      expect(useCartStore.getState().isOpen).toBe(true);
      
      store.toggleCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });
});
