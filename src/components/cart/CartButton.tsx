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
      variant="outline" 
      size="icon" 
      className="relative h-9 w-9 border-2 border-primary bg-primary/10 hover:bg-primary/20 hover:border-primary transition-all duration-200 hover:scale-105 shadow-md"
      onClick={openCart}
      aria-label={t('common:cart')}
    >
      <ShoppingCart className="h-5 w-5 text-primary" />
      {totalItems > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground font-bold shadow-lg animate-pulse"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </Button>
  );
};
