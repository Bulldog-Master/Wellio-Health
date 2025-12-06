import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onProductFound: (product: ProductInfo) => void;
}

export interface ProductInfo {
  barcode: string;
  name: string;
  brand?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
  imageUrl?: string;
}

export const BarcodeScanner = ({ open, onClose, onProductFound }: BarcodeScannerProps) => {
  const { t } = useTranslation(['food', 'common']);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    readerRef.current = null;
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    setError(null);
    setScannedProduct(null);
    setIsScanning(true);

    try {
      readerRef.current = new BrowserMultiFormatReader();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        readerRef.current.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result) {
            const barcode = result.getText();
            stopScanning();
            lookupProduct(barcode);
          }
        });
      }
    } catch (err) {
      console.error('Scanner error:', err);
      setError(t('food:scanner_camera_error'));
      setIsScanning(false);
    }
  }, [t, stopScanning]);

  useEffect(() => {
    if (open && !isScanning && !scannedProduct && !isLoading) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [open]);

  const lookupProduct = async (barcode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutrients = product.nutriments || {};
        
        const productInfo: ProductInfo = {
          barcode,
          name: product.product_name || t('food:unknown_product'),
          brand: product.brands,
          calories: nutrients['energy-kcal_100g'] || nutrients['energy-kcal'],
          protein: nutrients.proteins_100g || nutrients.proteins,
          carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates,
          fat: nutrients.fat_100g || nutrients.fat,
          servingSize: product.serving_size || '100g',
          imageUrl: product.image_front_small_url,
        };

        setScannedProduct(productInfo);
      } else {
        setError(t('food:product_not_found'));
      }
    } catch (err) {
      console.error('Product lookup error:', err);
      setError(t('food:scanner_lookup_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (scannedProduct) {
      onProductFound(scannedProduct);
      toast.success(t('food:product_added'));
      onClose();
    }
  };

  const handleRetry = () => {
    setScannedProduct(null);
    setError(null);
    startScanning();
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('food:scan_barcode')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isScanning && !scannedProduct && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-primary rounded-lg opacity-70" />
              </div>
              <p className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">
                {t('food:scanner_instructions')}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t('food:looking_up_product')}</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-muted-foreground">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                {t('food:scan_again')}
              </Button>
            </div>
          )}

          {scannedProduct && !isLoading && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {scannedProduct.imageUrl && (
                    <img
                      src={scannedProduct.imageUrl}
                      alt={scannedProduct.name}
                      className="w-20 h-20 object-contain rounded-lg bg-white"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{scannedProduct.name}</h3>
                    {scannedProduct.brand && (
                      <p className="text-sm text-muted-foreground">{scannedProduct.brand}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('food:serving_size')}: {scannedProduct.servingSize}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-primary">
                      {scannedProduct.calories?.toFixed(0) || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('food:calories')}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-blue-500">
                      {scannedProduct.protein?.toFixed(1) || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">{t('food:protein')}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-amber-500">
                      {scannedProduct.carbs?.toFixed(1) || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">{t('food:carbs')}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-red-500">
                      {scannedProduct.fat?.toFixed(1) || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">{t('food:fat')}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={handleRetry} variant="outline" className="flex-1">
                    {t('food:scan_again')}
                  </Button>
                  <Button onClick={handleAddProduct} className="flex-1">
                    {t('food:add_to_log')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
