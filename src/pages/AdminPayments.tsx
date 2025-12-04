import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, XCircle, Clock, Building, Wallet, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminPayments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['payments', 'admin', 'common']);
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [txHash, setTxHash] = useState('');

  // Fetch pending e-transfers
  const { data: etransfers, isLoading: loadingEtransfers, refetch: refetchEtransfers } = useQuery({
    queryKey: ['admin-etransfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('etransfer_requests')
        .select('*, profiles:user_id(username, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch pending crypto payments
  const { data: cryptoPayments, isLoading: loadingCrypto, refetch: refetchCrypto } = useQuery({
    queryKey: ['admin-crypto-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('*, profiles:user_id(username, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const verifyEtransferMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-etransfer', {
        body: { etransfer_id: id, action, notes },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(t('payments:verification_success', 'Payment verified successfully'));
      queryClient.invalidateQueries({ queryKey: ['admin-etransfers'] });
      setSelectedPayment(null);
      setAction(null);
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || t('payments:verification_error', 'Verification failed'));
    },
  });

  const verifyCryptoMutation = useMutation({
    mutationFn: async ({ id, action, txHash, notes }: { id: string; action: string; txHash?: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-crypto', {
        body: { crypto_payment_id: id, action, tx_hash: txHash, notes },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(t('payments:verification_success', 'Payment verified successfully'));
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-payments'] });
      setSelectedPayment(null);
      setAction(null);
      setNotes('');
      setTxHash('');
    },
    onError: (error: any) => {
      toast.error(error.message || t('payments:verification_error', 'Verification failed'));
    },
  });

  const handleVerify = () => {
    if (!selectedPayment || !action) return;

    if (selectedPayment.type === 'etransfer') {
      verifyEtransferMutation.mutate({
        id: selectedPayment.id,
        action,
        notes,
      });
    } else {
      verifyCryptoMutation.mutate({
        id: selectedPayment.id,
        action,
        txHash,
        notes,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      verified: 'default',
      confirmed: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      failed: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <SEOHead
        titleKey="payment_verification"
        descriptionKey="payment_verification_desc"
        namespace="admin"
      />
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">{t('admin:payment_verification', 'Payment Verification')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('admin:verify_pending_payments', 'Review and verify pending payment requests')}
            </p>
          </div>

          <Tabs defaultValue="etransfer">
            <TabsList className="mb-6">
              <TabsTrigger value="etransfer" className="gap-2">
                <Building className="w-4 h-4" />
                {t('payments:bank_transfer', 'E-Transfer')}
                {etransfers?.filter(e => e.status === 'pending').length ? (
                  <Badge variant="secondary" className="ml-1">
                    {etransfers.filter(e => e.status === 'pending').length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="crypto" className="gap-2">
                <Wallet className="w-4 h-4" />
                {t('payments:cryptocurrency', 'Crypto')}
                {cryptoPayments?.filter(e => e.status === 'pending').length ? (
                  <Badge variant="secondary" className="ml-1">
                    {cryptoPayments.filter(e => e.status === 'pending').length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="etransfer">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={() => refetchEtransfers()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common:refresh', 'Refresh')}
                </Button>
              </div>

              {loadingEtransfers ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : etransfers && etransfers.length > 0 ? (
                <div className="space-y-4">
                  {etransfers.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {(item.profiles as any)?.username || (item.profiles as any)?.full_name || 'Unknown User'}
                            </p>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('payments:confirmation_number', 'Confirmation')}: {item.confirmation_number || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('payments:your_email', 'Email')}: {item.reference_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'PPP p')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold">${item.amount.toFixed(2)}</span>
                          {item.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment({ ...item, type: 'etransfer' });
                                  setAction('approve');
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t('common:approve', 'Approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedPayment({ ...item, type: 'etransfer' });
                                  setAction('reject');
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                {t('common:reject', 'Reject')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('admin:no_pending_etransfers', 'No e-transfer requests')}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="crypto">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={() => refetchCrypto()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common:refresh', 'Refresh')}
                </Button>
              </div>

              {loadingCrypto ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : cryptoPayments && cryptoPayments.length > 0 ? (
                <div className="space-y-4">
                  {cryptoPayments.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {(item.profiles as any)?.username || (item.profiles as any)?.full_name || 'Unknown User'}
                            </p>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.crypto_currency.toUpperCase()} - {item.amount_crypto || 'TBD'} {item.crypto_currency}
                          </p>
                          {item.tx_hash && (
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                              TX: {item.tx_hash}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'PPP p')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold">${item.amount_usd.toFixed(2)}</span>
                          {item.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment({ ...item, type: 'crypto' });
                                  setAction('approve');
                                  setTxHash(item.tx_hash || '');
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t('common:approve', 'Approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedPayment({ ...item, type: 'crypto' });
                                  setAction('reject');
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                {t('common:reject', 'Reject')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('admin:no_pending_crypto', 'No crypto payment requests')}
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!selectedPayment && !!action} onOpenChange={() => { setSelectedPayment(null); setAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' 
                ? t('admin:approve_payment', 'Approve Payment')
                : t('admin:reject_payment', 'Reject Payment')}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? t('admin:approve_payment_desc', 'This will activate the user\'s subscription or add-on.')
                : t('admin:reject_payment_desc', 'This will mark the payment as failed.')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPayment?.type === 'crypto' && action === 'approve' && (
              <div>
                <label className="text-sm font-medium">
                  {t('payments:transaction_hash', 'Transaction Hash')}
                </label>
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 font-mono"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">
                {t('admin:notes', 'Notes')} ({t('common:optional', 'Optional')})
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('admin:add_notes', 'Add any notes about this verification...')}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedPayment(null); setAction(null); }}>
              {t('common:cancel', 'Cancel')}
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={handleVerify}
              disabled={verifyEtransferMutation.isPending || verifyCryptoMutation.isPending}
            >
              {verifyEtransferMutation.isPending || verifyCryptoMutation.isPending
                ? t('common:processing', 'Processing...')
                : action === 'approve'
                ? t('common:approve', 'Approve')
                : t('common:reject', 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPayments;
