import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from 'react-i18next';

export const CartButton = () => {
  const { t } = useTranslation(['common']);
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative hover:bg-sidebar-accent text-sidebar-foreground h-8 w-8"
      onClick={openCart}
      aria-label={t('common:cart')}
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground animate-pulse"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </Button>
  );
};
