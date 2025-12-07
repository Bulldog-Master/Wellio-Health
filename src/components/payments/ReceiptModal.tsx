import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ReceiptData {
  receipt_number: string;
  date: string;
  customer: {
    name: string;
    email: string;
  };
  transaction: {
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    payment_method: string;
    completed_at: string | null;
  };
  company: {
    name: string;
    address: string;
    email: string;
  };
  items: ReceiptItem[];
}

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export function ReceiptModal({ open, onOpenChange, transactionId }: ReceiptModalProps) {
  const { t } = useTranslation(['payments', 'common']);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReceipt = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { transaction_id: transactionId },
      });

      if (error) throw error;
      setReceipt(data.receipt);
    } catch (error: any) {
      console.error('Error fetching receipt:', error);
      toast.error(t('payments:receipt_error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) return;
    
    const content = generateReceiptHTML(receipt);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receipt_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('payments:receipt_downloaded'));
  };

  // Fetch receipt when modal opens
  if (open && !receipt && !loading && transactionId) {
    fetchReceipt();
  }

  // Reset when modal closes
  if (!open && receipt) {
    setReceipt(null);
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg print:max-w-full print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            {t('payments:receipt')}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : receipt ? (
          <div className="space-y-6 print:p-8" id="receipt-content">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{receipt.company.name}</h2>
              <p className="text-muted-foreground text-sm">{receipt.company.address}</p>
              <p className="text-muted-foreground text-sm">{receipt.company.email}</p>
            </div>

            <Separator />

            {/* Receipt Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('payments:receipt_number')}</p>
                <p className="font-mono font-semibold">{receipt.receipt_number}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">{t('payments:date')}</p>
                <p className="font-semibold">{receipt.date}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('payments:bill_to')}</p>
              <p className="font-semibold">{receipt.customer.name}</p>
              <p className="text-sm text-muted-foreground">{receipt.customer.email}</p>
            </div>

            {/* Items */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">{t('payments:description')}</th>
                    <th className="text-center py-2">{t('payments:qty')}</th>
                    <th className="text-right py-2">{t('payments:price')}</th>
                    <th className="text-right py-2">{t('payments:total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">
                        {formatCurrency(item.unit_price, receipt.transaction.currency)}
                      </td>
                      <td className="text-right py-2">
                        {formatCurrency(item.total, receipt.transaction.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('payments:total')}</span>
                  <span>{formatCurrency(receipt.transaction.amount, receipt.transaction.currency)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('payments:payment_method')}</p>
                <p className="font-semibold">{receipt.transaction.payment_method}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">{t('payments:status')}</p>
                <p className={`font-semibold ${
                  receipt.transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {t(`payments:status_${receipt.transaction.status}`)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4">
              <p>{t('payments:receipt_thank_you')}</p>
              <p>{t('payments:receipt_questions')}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {t('payments:no_receipt_data')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function generateReceiptHTML(receipt: ReceiptData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${receipt.receipt_number}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { color: #666; margin: 5px 0; }
    .divider { border-top: 1px solid #eee; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .info-label { color: #666; font-size: 14px; }
    .customer-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { font-weight: 600; }
    .text-right { text-align: right; }
    .total-row { font-size: 18px; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${receipt.company.name}</h1>
    <p>${receipt.company.address}</p>
    <p>${receipt.company.email}</p>
  </div>
  <div class="divider"></div>
  <div class="info-row">
    <div>
      <div class="info-label">Receipt Number</div>
      <div><strong>${receipt.receipt_number}</strong></div>
    </div>
    <div class="text-right">
      <div class="info-label">Date</div>
      <div><strong>${receipt.date}</strong></div>
    </div>
  </div>
  <div class="customer-box">
    <div class="info-label">Bill To</div>
    <div><strong>${receipt.customer.name}</strong></div>
    <div>${receipt.customer.email}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${receipt.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">$${item.unit_price.toFixed(2)}</td>
          <td class="text-right">$${item.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="info-row total-row">
    <div>Total</div>
    <div>$${receipt.transaction.amount.toFixed(2)} ${receipt.transaction.currency}</div>
  </div>
  <div class="divider"></div>
  <div class="info-row">
    <div>
      <div class="info-label">Payment Method</div>
      <div><strong>${receipt.transaction.payment_method}</strong></div>
    </div>
    <div class="text-right">
      <div class="info-label">Status</div>
      <div><strong style="color: ${receipt.transaction.status === 'completed' ? 'green' : 'orange'}">
        ${receipt.transaction.status.charAt(0).toUpperCase() + receipt.transaction.status.slice(1)}
      </strong></div>
    </div>
  </div>
  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Questions? Contact us at ${receipt.company.email}</p>
  </div>
</body>
</html>
  `;
}
