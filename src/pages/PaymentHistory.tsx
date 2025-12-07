import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Wallet, Building, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import SEOHead from '@/components/SEOHead';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
const PaymentHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['payments', 'common']);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['payment-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'crypto':
        return <Wallet className="w-5 h-5" />;
      case 'etransfer':
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <>
      <SEOHead
        titleKey="payment_history"
        descriptionKey="payment_history_desc"
        namespace="payments"
      />
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">{t('payments:payment_history', 'Payment History')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('payments:view_transactions', 'View all your past transactions')}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getPaymentMethodIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {transaction.transaction_type === 'subscription' 
                              ? t('payments:subscription_payment', 'Subscription Payment')
                              : transaction.transaction_type === 'addon'
                              ? t('payments:addon_purchase', 'Add-on Purchase')
                              : t('payments:payment', 'Payment')}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP')}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {transaction.transaction_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTransactionId(transaction.id);
                          setReceiptOpen(true);
                        }}
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        {t('payments:receipt')}
                      </Button>
                      <span className="text-lg font-semibold">
                        ${transaction.amount.toFixed(2)} {transaction.currency.toUpperCase()}
                      </span>
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {t('payments:no_transactions', 'No transactions yet')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('payments:no_transactions_desc', 'Your payment history will appear here')}
              </p>
              <Button onClick={() => navigate('/subscription')}>
                {t('payments:view_plans', 'View Plans')}
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        transactionId={selectedTransactionId}
      />
    </>
  );
};

export default PaymentHistory;
