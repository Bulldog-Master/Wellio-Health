import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useFeedState = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['feed']);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedHashtag = searchParams.get("hashtag");
  
  const [postContent, setPostContent] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);
  const [showReferralBanner, setShowReferralBanner] = useState(() => {
    return localStorage.getItem('hideReferralBanner') !== 'true';
  });

  const handleHashtagClick = (hashtag: string) => {
    setSearchParams({ hashtag });
  };

  const clearHashtagFilter = () => {
    setSearchParams({});
  };

  const handleSharePost = (postId: string, platform?: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopiedPostId(postId);
      toast({ title: t('link_copied') });
      setTimeout(() => setCopiedPostId(null), 2000);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('file_too_large'),
          description: t('select_image_under'),
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

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: t('file_too_large'),
          description: t('select_video_under'),
          variant: "destructive",
        });
        return;
      }
      setUploadedVideo(file);
      setUploadedImage(null);
      setImagePreview(null);
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
    }
  };

  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  };

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const handleReportPost = (postId: string) => {
    setReportPostId(postId);
    setReportDialogOpen(true);
  };

  const resetPostForm = () => {
    setPostContent("");
    setUploadedImage(null);
    setUploadedVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const resetEditForm = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const resetReportForm = () => {
    setReportDialogOpen(false);
    setReportPostId(null);
    setReportReason("");
    setReportDetails("");
  };

  const dismissReferralBanner = () => {
    setShowReferralBanner(false);
    localStorage.setItem('hideReferralBanner', 'true');
    setTimeout(() => {
      localStorage.removeItem('hideReferralBanner');
    }, 24 * 60 * 60 * 1000);
  };

  return {
    // State
    selectedHashtag,
    postContent,
    setPostContent,
    selectedPostId,
    setSelectedPostId,
    commentContent,
    setCommentContent,
    uploadedImage,
    uploadedVideo,
    imagePreview,
    videoPreview,
    copiedPostId,
    editingPostId,
    editContent,
    setEditContent,
    reportDialogOpen,
    setReportDialogOpen,
    reportPostId,
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    animatingReaction,
    setAnimatingReaction,
    showReferralBanner,
    
    // Handlers
    handleHashtagClick,
    clearHashtagFilter,
    handleSharePost,
    handleImageSelect,
    handleRemoveImage,
    handleVideoSelect,
    handleRemoveVideo,
    handleEditPost,
    handleCancelEdit,
    handleReportPost,
    resetPostForm,
    resetEditForm,
    resetReportForm,
    dismissReferralBanner,
  };
};
