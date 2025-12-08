import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video, Crown, Send, X } from "lucide-react";
import { MentionInput } from "@/components/MentionInput";
import { useTranslation } from "react-i18next";

interface CreatePostCardProps {
  postContent: string;
  setPostContent: (content: string) => void;
  imagePreview: string | null;
  videoPreview: string | null;
  canPostVideos: boolean;
  isPending: boolean;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onRemoveVideo: () => void;
  onSubmit: () => void;
  uploadedImage: File | null;
  uploadedVideo: File | null;
}

export const CreatePostCard = ({
  postContent,
  setPostContent,
  imagePreview,
  videoPreview,
  canPostVideos,
  isPending,
  onImageSelect,
  onVideoSelect,
  onRemoveImage,
  onRemoveVideo,
  onSubmit,
  uploadedImage,
  uploadedVideo,
}: CreatePostCardProps) => {
  const { t } = useTranslation(['social', 'feed']);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6 space-y-4">
        <MentionInput
          placeholder={t('share_progress')}
          value={postContent}
          onChange={setPostContent}
          rows={3}
        />
    
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt={t('feed:upload_preview')}
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {videoPreview && (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full max-h-64 rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onRemoveVideo}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageSelect}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={onVideoSelect}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || !!uploadedVideo}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('feed:add_photo')}
            </Button>
            {canPostVideos ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={isPending || !!uploadedImage}
              >
                <Video className="w-4 h-4 mr-2" />
                {t('feed:add_video')}
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/subscription')}
                className="text-muted-foreground"
              >
                <Video className="w-4 h-4 mr-2" />
                <Crown className="w-3 h-3 mr-1 text-primary" />
                {t('feed:add_video')}
              </Button>
            )}
          </div>
          <Button
            onClick={onSubmit}
            disabled={(!postContent.trim() && !uploadedImage && !uploadedVideo) || isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {isPending ? t('posting') : t('post')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
