import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Image, Video, Calendar, Search, Filter, Trash2, Download, Play, Grid, List } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface WorkoutMediaItem {
  id: string;
  file_url: string;
  file_type: string;
  created_at: string;
  activity_log_id: string;
  activity_type?: string;
  logged_at?: string;
}

const WorkoutMedia = () => {
  const { t } = useTranslation(['workout', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [media, setMedia] = useState<WorkoutMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<WorkoutMediaItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activityTypes, setActivityTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch media with activity log details
      const { data: mediaData, error } = await supabase
        .from('workout_media')
        .select(`
          id,
          file_url,
          file_type,
          created_at,
          activity_log_id,
          activity_logs (
            activity_type,
            logged_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMedia = (mediaData || []).map((item: any) => ({
        id: item.id,
        file_url: item.file_url,
        file_type: item.file_type,
        created_at: item.created_at,
        activity_log_id: item.activity_log_id,
        activity_type: item.activity_logs?.activity_type,
        logged_at: item.activity_logs?.logged_at,
      }));

      setMedia(formattedMedia);

      // Extract unique activity types
      const types = [...new Set(formattedMedia.map(m => m.activity_type).filter(Boolean))] as string[];
      setActivityTypes(types);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: t('common:error'),
        description: t('workout:error_loading_media'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from('workout_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      setMedia(prev => prev.filter(m => m.id !== mediaId));
      setSelectedMedia(null);
      
      toast({
        title: t('common:deleted'),
        description: t('workout:media_deleted'),
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: t('common:error'),
        description: t('workout:error_deleting_media'),
        variant: "destructive",
      });
    }
  };

  const filteredMedia = media.filter(item => {
    if (filterType !== 'all') {
      const isImage = item.file_type?.startsWith('image/');
      if (filterType === 'image' && !isImage) return false;
      if (filterType === 'video' && isImage) return false;
    }
    if (filterActivity !== 'all' && item.activity_type !== filterActivity) return false;
    if (searchQuery && !item.activity_type?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const imageCount = media.filter(m => m.file_type?.startsWith('image/')).length;
  const videoCount = media.filter(m => !m.file_type?.startsWith('image/')).length;

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/activity')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('workout:media_gallery')}</h1>
            <p className="text-muted-foreground">{t('workout:media_gallery_desc')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{imageCount}</p>
                <p className="text-sm text-muted-foreground">{t('workout:photos')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10">
                <Video className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videoCount}</p>
                <p className="text-sm text-muted-foreground">{t('workout:videos')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{media.length}</p>
                <p className="text-sm text-muted-foreground">{t('common:total')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common:search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common:all')}</SelectItem>
                  <SelectItem value="image">{t('workout:photos')}</SelectItem>
                  <SelectItem value="video">{t('workout:videos')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterActivity} onValueChange={setFilterActivity}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t('workout:activity_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common:all')}</SelectItem>
                  {activityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid/List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{t('common:loading')}</div>
        ) : filteredMedia.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t('workout:no_media_yet')}</p>
              <p className="text-muted-foreground mt-1">{t('workout:no_media_desc')}</p>
              <Button className="mt-4" onClick={() => navigate('/workout')}>
                {t('workout:log_workout')}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map(item => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-border hover:border-primary transition-colors"
                onClick={() => setSelectedMedia(item)}
              >
                {item.file_type?.startsWith('image/') ? (
                  <img
                    src={item.file_url}
                    alt={item.activity_type || 'Workout'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <p className="text-xs text-white font-medium truncate">{item.activity_type}</p>
                    <p className="text-xs text-white/70">
                      {item.logged_at && format(new Date(item.logged_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                {!item.file_type?.startsWith('image/') && (
                  <div className="absolute top-2 right-2">
                    <Video className="h-4 w-4 text-white drop-shadow" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map(item => (
              <Card
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedMedia(item)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {item.file_type?.startsWith('image/') ? (
                      <img
                        src={item.file_url}
                        alt={item.activity_type || 'Workout'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.activity_type || t('workout:workout')}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.logged_at && format(new Date(item.logged_at), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.file_type?.startsWith('image/') ? (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Media Viewer Dialog */}
        <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center justify-between">
                <div>
                  <span>{selectedMedia?.activity_type || t('workout:workout')}</span>
                  {selectedMedia?.logged_at && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {format(new Date(selectedMedia.logged_at), 'MMMM d, yyyy • h:mm a')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={selectedMedia?.file_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => selectedMedia && handleDeleteMedia(selectedMedia.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center bg-black/90 min-h-[400px] max-h-[70vh]">
              {selectedMedia?.file_type?.startsWith('image/') ? (
                <img
                  src={selectedMedia.file_url}
                  alt={selectedMedia.activity_type || 'Workout'}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : selectedMedia && (
                <video
                  src={selectedMedia.file_url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh]"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default WorkoutMedia;
