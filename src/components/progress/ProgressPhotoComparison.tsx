import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Camera, ArrowLeftRight, Calendar, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  taken_at: string;
  notes: string | null;
  weight_lbs: number | null;
}

const ProgressPhotoComparison = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const { toast } = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [leftPhoto, setLeftPhoto] = useState<string>("");
  const [rightPhoto, setRightPhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('progress_photos')
        .select('id, photo_url, taken_at, notes, weight_lbs')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
      
      // Auto-select first and last if we have at least 2 photos
      if (data && data.length >= 2) {
        setLeftPhoto(data[data.length - 1].id);
        setRightPhoto(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching progress photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPhoto = (photoId: string) => {
    return photos.find(p => p.id === photoId);
  };

  const leftPhotoData = getSelectedPhoto(leftPhoto);
  const rightPhotoData = getSelectedPhoto(rightPhoto);

  const calculateDaysDiff = () => {
    if (!leftPhotoData || !rightPhotoData) return null;
    const left = new Date(leftPhotoData.taken_at);
    const right = new Date(rightPhotoData.taken_at);
    const diffTime = Math.abs(right.getTime() - left.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysDiff = calculateDaysDiff();

  const calculateWeightDiff = () => {
    if (!leftPhotoData?.weight_lbs || !rightPhotoData?.weight_lbs) return null;
    return rightPhotoData.weight_lbs - leftPhotoData.weight_lbs;
  };

  const weightDiff = calculateWeightDiff();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            {t('fitness:progress_comparison')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Camera className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('fitness:need_more_photos')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('fitness:need_at_least_two_photos')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('fitness:photos_count', { count: photos.length })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          {t('fitness:progress_comparison')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">{t('fitness:before_photo')}</Label>
            <Select value={leftPhoto} onValueChange={setLeftPhoto}>
              <SelectTrigger>
                <SelectValue placeholder={t('fitness:select_photo')} />
              </SelectTrigger>
              <SelectContent>
                {photos.map((photo) => (
                  <SelectItem key={photo.id} value={photo.id}>
                    {format(new Date(photo.taken_at), 'MMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">{t('fitness:after_photo')}</Label>
            <Select value={rightPhoto} onValueChange={setRightPhoto}>
              <SelectTrigger>
                <SelectValue placeholder={t('fitness:select_photo')} />
              </SelectTrigger>
              <SelectContent>
                {photos.map((photo) => (
                  <SelectItem key={photo.id} value={photo.id}>
                    {format(new Date(photo.taken_at), 'MMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Stats */}
        {daysDiff !== null && (
          <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">
              {t('fitness:days_of_progress', { days: daysDiff })}
            </span>
          </div>
        )}

        {/* Photo Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {leftPhotoData ? (
              <>
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={leftPhotoData.photo_url}
                    alt={t('fitness:before_photo')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center gap-1 text-white text-sm">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(leftPhotoData.taken_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                {leftPhotoData.notes && (
                  <p className="text-sm text-muted-foreground">{leftPhotoData.notes}</p>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">{t('fitness:select_photo')}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {rightPhotoData ? (
              <>
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={rightPhotoData.photo_url}
                    alt={t('fitness:after_photo')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center gap-1 text-white text-sm">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(rightPhotoData.taken_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                {rightPhotoData.notes && (
                  <p className="text-sm text-muted-foreground">{rightPhotoData.notes}</p>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">{t('fitness:select_photo')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              const temp = leftPhoto;
              setLeftPhoto(rightPhoto);
              setRightPhoto(temp);
            }}
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            {t('fitness:swap_photos')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressPhotoComparison;
