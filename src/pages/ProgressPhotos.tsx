import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, ArrowLeft, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatWeight } from "@/lib/unitConversion";
import { useTranslation } from "react-i18next";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  weight_lbs: number | null;
  notes: string | null;
  taken_at: string;
}

const ProgressPhotos = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const { preferredUnit } = useUserPreferences();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  // Debug
  console.log('Progress Photos - Language:', i18n.language);
  console.log('Progress Photos - progressPhotos translation:', t('progressPhotos'));

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error(t('failedToLoadProgressPhotos'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t('pleaseSelectPhoto'));
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      // Save to database
      const weightLbs = weight ? parseFloat(weight) : null;
      
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          weight_lbs: weightLbs,
          notes: notes || null,
        });

      if (dbError) throw dbError;

      toast.success(t('progressPhotoAdded'));
      setSelectedFile(null);
      setWeight("");
      setNotes("");
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(t('failedToUploadPhoto'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/progress-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        await supabase.storage
          .from('progress-photos')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('photoDeleted'));
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(t('failedToDeletePhoto'));
    }
  };

  if (loading) {
    return <div className="p-6">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToDashboard')}
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('progressPhotos')}</h1>
          <p className="text-muted-foreground">{t('trackTransformationVisually')}</p>
        </div>
      </div>

      {/* Upload Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('addNewPhoto')}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="photo">{t('photo')}</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('selected')}: {selectedFile.name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="weight">{t('weightOptional')}</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder={`${t('enterWeightIn')} ${preferredUnit === 'metric' ? 'kg' : 'lbs'}`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">{t('notesOptional')}</Label>
            <Textarea
              id="notes"
              placeholder={t('howFeelingMilestones')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? t('uploading') : t('uploadPhoto')}
          </Button>
        </div>
      </Card>

      {/* Photos Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('yourJourney')}</h3>
        {photos.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                {t('noProgressPhotosYet')}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <img
                  src={photo.photo_url}
                  alt={t('progressPhoto')}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {format(new Date(photo.taken_at), 'MMM d, yyyy')}
                      </p>
                      {photo.weight_lbs && (
                        <p className="text-sm text-muted-foreground">
                          {formatWeight(photo.weight_lbs, preferredUnit)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(photo.id, photo.photo_url)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {photo.notes && (
                    <p className="text-sm text-muted-foreground">{photo.notes}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPhotos;