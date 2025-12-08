import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useRealtimeStories } from "@/hooks/social";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, X, User, Eye, Image as ImageIcon, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

const Stories = () => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useRealtimeStories();

  // Fetch active stories
  const { data: stories } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data: storiesData, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      if (!storiesData || storiesData.length === 0) return [];

      const userIds = [...new Set(storiesData.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Group stories by user
      const groupedStories = storiesData.reduce((acc: any, story) => {
        const userId = story.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            profile: profiles?.find(p => p.id === userId),
            stories: []
          };
        }
        acc[userId].stories.push(story);
        return acc;
      }, {});

      return Object.values(groupedStories);
    },
  });

  const createStory = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!uploadedImage) {
        throw new Error("Please add an image to your story");
      }

      const fileExt = uploadedImage.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, uploadedImage);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      const mediaUrl = data.publicUrl;

      const { error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          caption: caption || null,
          media_url: mediaUrl,
          media_type: "image",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setCreateDialogOpen(false);
      setCaption("");
      setUploadedImage(null);
      setImagePreview(null);
      toast({ title: t('story_shared') });
    },
  });

  const recordStoryView = useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("story_views")
        .insert({ story_id: storyId, viewer_id: user.id })
        .select()
        .single();
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewStory = (storyGroup: any) => {
    setSelectedStory(storyGroup);
    setViewDialogOpen(true);
    if (storyGroup.stories[0]) {
      recordStoryView.mutate(storyGroup.stories[0].id);
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
        {/* Create Story Card */}
        <Card 
          className="min-w-[120px] cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setCreateDialogOpen(true)}
        >
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs font-medium text-center">Your Story</p>
          </CardContent>
        </Card>

        {/* Story Cards */}
        {stories?.map((storyGroup: any) => (
          <Card 
            key={storyGroup.user_id}
            className="min-w-[120px] cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewStory(storyGroup)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <div className="relative">
                <Avatar className="w-16 h-16 ring-2 ring-primary">
                  {storyGroup.profile?.avatar_url ? (
                    <AvatarImage src={storyGroup.profile.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {storyGroup.stories.length > 1 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {storyGroup.stories.length}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-center truncate w-full">
                {storyGroup.profile?.full_name || "Anonymous"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Story Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a caption... (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
            />

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setUploadedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-between">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
              <Button
                onClick={() => createStory.mutate()}
                disabled={!uploadedImage || createStory.isPending}
              >
                {createStory.isPending ? "Sharing..." : "Share Story"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Story Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedStory && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  {selectedStory.profile?.avatar_url ? (
                    <AvatarImage src={selectedStory.profile.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">
                    {selectedStory.profile?.full_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedStory.stories[0].created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {selectedStory.stories[0].views_count}
                </div>
              </div>

              {selectedStory.stories[0].media_url && (
                <img
                  src={selectedStory.stories[0].media_url}
                  alt="Story"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              )}

              {selectedStory.stories[0].caption && (
                <p className="text-lg">{selectedStory.stories[0].caption}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Stories;
