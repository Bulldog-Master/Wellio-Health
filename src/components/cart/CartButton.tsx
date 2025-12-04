import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';

export const CartButton = () => {
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={openCart}
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </Button>
  );
};
