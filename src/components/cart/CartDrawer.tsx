import { useTranslation } from 'react-i18next';
import { ShoppingCart, Minus, Plus, Trash2, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCartStore, CartItem } from '@/stores/cartStore';
import { useState } from 'react';
import { CheckoutDialog } from '@/components/payments/CheckoutDialog';

export const CartDrawer = () => {
  const { t, i18n } = useTranslation(['common', 'subscription', 'payments']);
  const isSpanish = i18n.language?.startsWith('es');
  
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalPrice 
  } = useCartStore();
  
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  const totalPrice = getTotalPrice();
  
  const getItemName = (item: CartItem) => {
    return isSpanish && item.name_es ? item.name_es : item.name;
  };
  
  const getItemDescription = (item: CartItem) => {
    return isSpanish && item.description_es ? item.description_es : item.description;
  };
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  const getItemTypeLabel = (type: CartItem['type']) => {
    switch (type) {
      case 'subscription':
        return t('subscription:subscription');
      case 'addon':
        return t('subscription:addon');
      case 'product':
        return t('common:product');
      default:
        return '';
    }
  };
  
  const handleCheckout = () => {
    setCheckoutOpen(true);
  };
  
  const handlePaymentSuccess = () => {
    clearCart();
    setCheckoutOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t('common:cart')}
              </SheetTitle>
              {items.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {t('common:clear_all')}
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <div className="flex flex-col flex-1 pt-4 min-h-0">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('common:cart_empty')}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable items area */}
                <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-3">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-3 p-3 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{getItemName(item)}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {getItemTypeLabel(item.type)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {getItemDescription(item)}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-primary">
                            {formatPrice(item.price)}
                            {item.billingCycle && (
                              <span className="text-xs text-muted-foreground ml-1">
                                /{item.billingCycle === 'monthly' ? t('subscription:per_month') : t('subscription:per_year')}
                              </span>
                            )}
                          </span>
                          
                          {/* Quantity controls - only for products */}
                          {item.type === 'product' && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Fixed checkout section */}
                <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t('common:total')}</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    className="w-full" 
                    size="lg"
                    disabled={items.length === 0}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('payments:proceed_to_checkout')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        itemName={items.length === 1 ? getItemName(items[0]) : `${items.length} ${t('common:items')}`}
        amount={totalPrice}
        billingCycle={items.find(i => i.billingCycle)?.billingCycle || 'monthly'}
        itemType={items.length === 1 ? items[0].type : 'product'}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};
