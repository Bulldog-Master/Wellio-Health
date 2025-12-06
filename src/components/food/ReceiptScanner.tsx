import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Receipt, Loader2, Check, X, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface ReceiptItem {
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  selected?: boolean;
}

export interface ReceiptData {
  restaurant_name?: string;
  items: ReceiptItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

interface ReceiptScannerProps {
  onItemsConfirmed: (items: ReceiptItem[]) => void;
}

export const ReceiptScanner = ({ onItemsConfirmed }: ReceiptScannerProps) => {
  const { t } = useTranslation(['food', 'common']);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setReceiptData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-receipt', {
        body: { imageBase64: imagePreview }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: t('food:analysis_failed'),
          description: data.error,
          variant: 'destructive'
        });
        return;
      }

      setReceiptData(data);
      // Select all items by default
      const initialSelection: Record<number, boolean> = {};
      data.items?.forEach((_: ReceiptItem, index: number) => {
        initialSelection[index] = true;
      });
      setSelectedItems(initialSelection);

      toast({
        title: t('food:receipt_analyzed'),
        description: t('food:receipt_analyzed_desc', { count: data.items?.length || 0 })
      });
    } catch (error: any) {
      console.error('Error analyzing receipt:', error);
      toast({
        title: t('food:analysis_failed'),
        description: error.message || t('food:receipt_analysis_failed_desc'),
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleItem = (index: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleConfirm = () => {
    if (!receiptData) return;

    const selected = receiptData.items.filter((_, index) => selectedItems[index]);
    if (selected.length === 0) {
      toast({
        title: t('food:no_items_selected'),
        description: t('food:select_at_least_one'),
        variant: 'destructive'
      });
      return;
    }

    onItemsConfirmed(selected);
    handleReset();
    setOpen(false);
  };

  const handleReset = () => {
    setImagePreview(null);
    setReceiptData(null);
    setSelectedItems({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const selectedTotals = receiptData?.items.reduce(
    (acc, item, index) => {
      if (selectedItems[index]) {
        acc.calories += item.calories * (item.quantity || 1);
        acc.protein += item.protein * (item.quantity || 1);
        acc.carbs += item.carbs * (item.quantity || 1);
        acc.fat += item.fat * (item.quantity || 1);
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Receipt className="h-4 w-4" />
          {t('food:scan_receipt')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t('food:scan_receipt')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imagePreview ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('food:receipt_instructions')}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">{t('food:take_photo')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">{t('food:upload_image')}</span>
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : !receiptData ? (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Receipt" 
                  className="w-full max-h-64 object-contain bg-muted"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('common:cancel')}
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('food:analyzing')}
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      {t('food:analyze_receipt')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {receiptData.restaurant_name && (
                <div className="text-center py-2 bg-muted rounded-lg">
                  <span className="font-medium">{receiptData.restaurant_name}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('food:select_items_to_log')}</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {receiptData.items.map((item, index) => (
                    <Card
                      key={index}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedItems[index] ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleItem(index)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedItems[index] || false}
                          onCheckedChange={() => toggleItem(index)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm truncate">
                              {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {item.calories * (item.quantity || 1)} cal
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            P: {item.protein * (item.quantity || 1)}g • 
                            C: {item.carbs * (item.quantity || 1)}g • 
                            F: {item.fat * (item.quantity || 1)}g
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedCount > 0 && (
                <Card className="p-3 bg-primary/10 border-primary">
                  <div className="text-sm font-medium mb-1">
                    {t('food:selected_total', { count: selectedCount })}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold">{selectedTotals.calories}</div>
                      <div className="text-muted-foreground">{t('food:calories')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{selectedTotals.protein}g</div>
                      <div className="text-muted-foreground">{t('food:protein')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{selectedTotals.carbs}g</div>
                      <div className="text-muted-foreground">{t('food:carbs')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{selectedTotals.fat}g</div>
                      <div className="text-muted-foreground">{t('food:fat')}</div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  {t('food:scan_again')}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedCount === 0}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t('food:add_to_log')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
