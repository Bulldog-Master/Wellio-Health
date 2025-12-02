import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Image as ImageIcon, User, X, Hash, TrendingUp, Share2, Copy, Check, Bookmark, Edit, MoreVertical, Flag, UserX, ArrowLeft, Users, Gift, Sparkles, Video, Crown, Lock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MentionInput } from "@/components/MentionInput";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import { SuggestedUsers } from "@/components/SuggestedUsers";
import { MessagesSidebar } from "@/components/MessagesSidebar";
import { LazyImage } from "@/components/LazyImage";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";

const Feed = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['social', 'feed']);
  const { hasFullAccess, hasFeature } = useSubscription();
  const canPostVideos = hasFullAccess || hasFeature('video_posts');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showReferralBanner, setShowReferralBanner] = useState(() => {
    return localStorage.getItem('hideReferralBanner') !== 'true';
  });

  // Enable real-time updates for posts
  useRealtimePosts(["feed-posts", selectedHashtag]);

  // Fetch posts with user profiles
  const { data: posts } = useQuery({
    queryKey: ["feed-posts", selectedHashtag],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*")
        .eq("is_public", true);

      // Filter by hashtag if selected
      if (selectedHashtag) {
        const { data: hashtagPosts } = await supabase
          .from("post_hashtags")
          .select("post_id")
          .eq("hashtag", selectedHashtag);

        const postIds = hashtagPosts?.map(h => h.post_id) || [];
        if (postIds.length === 0) return [];
        
        query = query.in("id", postIds);
      }

      const { data: postsData, error } = await query
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user profiles
      if (!postsData || postsData.length === 0) return [];

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return postsData.map(post => ({
        ...post,
        profile: profiles?.find(p => p.id === post.user_id)
      }));
    },
  });

  // Fetch trending hashtags
  const { data: trendingHashtags } = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_hashtags")
        .select("hashtag")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Count hashtag occurrences
      const hashtagCounts = data.reduce((acc: Record<string, number>, { hashtag }) => {
        acc[hashtag] = (acc[hashtag] || 0) + 1;
        return acc;
      }, {});

      // Sort by count and take top 10
      return Object.entries(hashtagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([hashtag, count]) => ({ hashtag, count }));
    },
  });

  // Fetch user's likes
  const { data: userLikes } = useQuery({
    queryKey: ["user-post-likes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(like => like.post_id);
    },
  });

  // Fetch user's bookmarks
  const { data: userBookmarks } = useQuery({
    queryKey: ["user-bookmarks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(b => b.post_id);
    },
  });

  // Fetch current user ID
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch user's reactions
  const { data: userReactions } = useQuery({
    queryKey: ["user-reactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from("reactions")
        .select("post_id, reaction_type")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.reduce((acc: Record<string, string>, r) => {
        acc[r.post_id] = r.reaction_type;
        return acc;
      }, {});
    },
  });

  // Fetch reactions counts for posts
  const { data: reactionsCounts } = useQuery({
    queryKey: ["reactions-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reactions")
        .select("post_id, reaction_type");

      if (error) throw error;

      return data.reduce((acc: Record<string, Record<string, number>>, r) => {
        if (!acc[r.post_id]) acc[r.post_id] = {};
        acc[r.post_id][r.reaction_type] = (acc[r.post_id][r.reaction_type] || 0) + 1;
        return acc;
      }, {});
    },
  });

  // Fetch comments for selected post
  const { data: comments } = useQuery({
    queryKey: ["post-comments", selectedPostId],
    queryFn: async () => {
      if (!selectedPostId) return [];

      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", selectedPostId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch user profiles for comments
      if (!commentsData || commentsData.length === 0) return [];

      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return commentsData.map(comment => ({
        ...comment,
        profile: profiles?.find(p => p.id === comment.user_id)
      }));
    },
    enabled: !!selectedPostId,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Rate limiting for post creation
      const rateLimitKey = `post:${user.id}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.POST_CREATE);

      if (!rateLimit.allowed) {
        throw new Error(`Creating posts too quickly. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)} seconds.`);
      }

      let mediaUrl = null;
      let postType = "text";

      // Upload video if present (premium only)
      if (uploadedVideo) {
        const fileRateLimit = await rateLimiter.check(`upload:${user.id}`, RATE_LIMITS.FILE_UPLOAD);
        if (!fileRateLimit.allowed) {
          throw new Error(`Uploading files too quickly. Please wait ${Math.ceil((fileRateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes.`);
        }

        const fileExt = uploadedVideo.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, uploadedVideo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

        mediaUrl = data.publicUrl;
        postType = "video";
      }
      // Upload image if present
      else if (uploadedImage) {
        const fileRateLimit = await rateLimiter.check(`upload:${user.id}`, RATE_LIMITS.FILE_UPLOAD);
        if (!fileRateLimit.allowed) {
          throw new Error(`Uploading files too quickly. Please wait ${Math.ceil((fileRateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes.`);
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

        mediaUrl = data.publicUrl;
        postType = "image";
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent,
          post_type: postType,
          media_url: mediaUrl,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setPostContent("");
      setUploadedImage(null);
      setUploadedVideo(null);
      setImagePreview(null);
      setVideoPreview(null);
      toast({ title: t('feed:post_created') });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Rate limiting for like actions
      const rateLimitKey = `like:${user.id}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.LIKE_ACTION);

      if (!rateLimit.allowed) {
        throw new Error(`Too many like actions. Please slow down.`);
      }

      const isLiked = userLikes?.includes(postId);

      if (isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onMutate: async (postId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed-posts"] });
      await queryClient.cancelQueries({ queryKey: ["user-post-likes"] });

      // Snapshot previous values
      const previousPosts = queryClient.getQueryData(["feed-posts"]);
      const previousLikes = queryClient.getQueryData(["user-post-likes"]);

      // Optimistically update likes
      queryClient.setQueryData(["user-post-likes"], (old: string[] | undefined) => {
        if (!old) return old;
        const isLiked = old.includes(postId);
        return isLiked ? old.filter(id => id !== postId) : [...old, postId];
      });

      // Optimistically update post likes count
      queryClient.setQueryData(["feed-posts"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map(post => {
          if (post.id === postId) {
            const isLiked = userLikes?.includes(postId);
            return {
              ...post,
              likes_count: post.likes_count + (isLiked ? -1 : 1)
            };
          }
          return post;
        });
      });

      return { previousPosts, previousLikes };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["feed-posts"], context.previousPosts);
      }
      if (context?.previousLikes) {
        queryClient.setQueryData(["user-post-likes"], context.previousLikes);
      }
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-post-likes"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!selectedPostId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Rate limiting for comment creation
      const rateLimitKey = `comment:${user.id}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.COMMENT_CREATE);

      if (!rateLimit.allowed) {
        throw new Error(`Creating comments too quickly. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)} seconds.`);
      }

      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: selectedPostId,
          content: commentContent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", selectedPostId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setCommentContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('feed:file_too_large'),
          description: t('feed:select_image_under'),
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: t('feed:file_too_large'),
          description: t('feed:select_video_under'),
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
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

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
      toast({ title: t('feed:link_copied') });
      setTimeout(() => setCopiedPostId(null), 2000);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    }
  };

  const toggleBookmark = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isBookmarked = userBookmarks?.includes(postId);

      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookmarks"] });
      toast({ title: t('feed:bookmark_updated') });
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentReaction = userReactions?.[postId];

      // Trigger animation
      setAnimatingReaction(`${postId}-${reactionType}`);
      setTimeout(() => setAnimatingReaction(null), 600);

      if (currentReaction === reactionType) {
        // Remove reaction
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Add or update reaction
        const { error } = await supabase
          .from("reactions")
          .upsert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reactions"] });
      queryClient.invalidateQueries({ queryKey: ["reactions-counts"] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      // First get the current edit count
      const { data: currentPost } = await supabase
        .from("posts")
        .select("edit_count")
        .eq("id", postId)
        .single();
      
      const { error } = await supabase
        .from("posts")
        .update({ 
          content, 
          edited_at: new Date().toISOString(),
          edit_count: (currentPost?.edit_count || 0) + 1
        })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setEditingPostId(null);
      setEditContent("");
      toast({ title: t('feed:post_updated') });
    },
  });

  const reportPost = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !reportPostId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_reports")
        .insert({
          reporter_id: user.id,
          post_id: reportPostId,
          reason: reportReason,
          details: reportDetails,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setReportDialogOpen(false);
      setReportPostId(null);
      setReportReason("");
      setReportDetails("");
      toast({ title: t('feed:report_submitted'), description: t('feed:thanks_community') });
    },
  });

  const blockUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("blocked_users")
        .insert({ user_id: user.id, blocked_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast({ title: t('feed:user_blocked') });
    },
  });

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const handleSaveEdit = () => {
    if (editingPostId && editContent.trim()) {
      updatePost.mutate({ postId: editingPostId, content: editContent });
    }
  };

  const handleReportPost = (postId: string) => {
    setReportPostId(postId);
    setReportDialogOpen(true);
  };

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(@\w+|#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        const hashtag = part.slice(1).toLowerCase();
        return (
          <span
            key={index}
            className="text-primary font-semibold cursor-pointer hover:underline"
            onClick={() => handleHashtagClick(hashtag)}
          >
            {part}
          </span>
        );
      } else if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="text-blue-500 font-semibold cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const reactionEmojis = {
    like: "❤️",
    fire: "🔥",
    muscle: "💪",
    clap: "👏",
    target: "🎯",
    heart: "💙",
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/connect")}
                className="hover:bg-primary/10"
                aria-label={t('back_to_connect')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{t('community_feed')}</h1>
                  <p className="text-muted-foreground mt-1">{t('share_fitness_journey')}</p>
                </div>
              </div>
            </div>
            {selectedHashtag && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-sm">
                  <Hash className="w-3 h-3 mr-1" />
                  {selectedHashtag}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearHashtagFilter}>
                  <X className="w-4 h-4" />
                  {t('clear_filter')}
                </Button>
              </div>
            )}
          </div>

          {/* Referral Banner */}
          {showReferralBanner && (
            <Card className="mb-6 overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 animate-fade-in">
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse">
                    <Gift className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      {t('get_1_month_pro_free')}
                      <Sparkles className="w-4 h-4 text-primary" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t('invite_4_friends')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/referral")}
                    className="shrink-0"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t('share_link')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowReferralBanner(false);
                      localStorage.setItem('hideReferralBanner', 'true');
                      setTimeout(() => {
                        localStorage.removeItem('hideReferralBanner');
                      }, 24 * 60 * 60 * 1000); // Show again after 24 hours
                    }}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Create Post */}
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
                onClick={handleRemoveImage}
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
                onClick={handleRemoveVideo}
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
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={createPost.isPending || !!uploadedVideo}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('feed:add_photo')}
              </Button>
              {canPostVideos ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={createPost.isPending || !!uploadedImage}
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
              onClick={() => createPost.mutate()}
              disabled={(!postContent.trim() && !uploadedImage && !uploadedVideo) || createPost.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {createPost.isPending ? t('posting') : t('post')}
            </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts?.map((post) => (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="cursor-pointer"
                        onClick={() => navigate(`/user/${post.user_id}`)}
                      >
                        {post.profile?.avatar_url ? (
                          <AvatarImage src={post.profile.avatar_url} alt={post.profile.full_name || "User"} />
                        ) : (
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p 
                          className="font-semibold cursor-pointer hover:underline"
                          onClick={() => navigate(`/user/${post.user_id}`)}
                        >
                          {post.profile?.full_name || t('anonymous')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          {post.edited_at && ` (${t('edited')})`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {post.post_type}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currentUser?.id === post.user_id ? (
                          <DropdownMenuItem onClick={() => handleEditPost(post)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('edit_post')}
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => handleReportPost(post.id)}>
                              <Flag className="w-4 h-4 mr-2" />
                              {t('report_post')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => blockUser.mutate(post.user_id)}
                              className="text-destructive"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              {t('block_user')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingPostId === post.id ? (
                    <div className="space-y-2">
                      <MentionInput
                        value={editContent}
                        onChange={setEditContent}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          {t('save')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          {t('cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{renderContentWithHashtags(post.content)}</p>
                  )}

              {post.media_url && post.post_type === 'video' ? (
                <video
                  src={post.media_url}
                  controls
                  className="rounded-lg w-full max-h-96"
                />
              ) : post.media_url && (
                <LazyImage
                  src={post.media_url}
                  alt="Post media"
                  className="rounded-lg w-full object-cover max-h-96"
                  skeletonClassName="w-full h-96 rounded-lg"
                />
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike.mutate(post.id)}
                    className={userLikes?.includes(post.id) ? "text-red-500" : ""}
                  >
                    <Heart
                      className={`w-4 h-4 mr-1 ${userLikes?.includes(post.id) ? "fill-current" : ""}`}
                    />
                    {post.likes_count}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments_count}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        {t('share')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'copy')}>
                        {copiedPostId === post.id ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {t('copy_link')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'twitter')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        {t('share_on_x')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'facebook')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        {t('share_on_facebook')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'linkedin')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        {t('share_on_linkedin')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark.mutate(post.id)}
                  className={userBookmarks?.includes(post.id) ? "text-primary" : ""}
                >
                  <Bookmark
                    className={`w-4 h-4 ${userBookmarks?.includes(post.id) ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(reactionEmojis).map(([type, emoji]) => {
                  const count = reactionsCounts?.[post.id]?.[type] || 0;
                  const isSelected = userReactions?.[post.id] === type;
                  const isAnimating = animatingReaction === `${post.id}-${type}`;
                  
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleReaction.mutate({ postId: post.id, reactionType: type })}
                      className={`h-8 transition-all duration-300 ${
                        isAnimating ? "animate-[bounce_0.6s_ease-in-out]" : ""
                      } ${isSelected ? "scale-110" : "hover:scale-105"}`}
                    >
                      <span className={`mr-1 inline-block ${isAnimating ? "animate-[spin_0.6s_ease-in-out]" : ""}`}>
                        {emoji}
                      </span>
                      {count > 0 && <span className="text-xs">{count}</span>}
                    </Button>
                  );
                })}
              </div>

              {/* Comments Section */}
              {selectedPostId === post.id && (
                <div className="space-y-3 pt-3 border-t">
                  {comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        {comment.profile?.avatar_url ? (
                          <AvatarImage
                            src={comment.profile.avatar_url}
                            alt={comment.profile.full_name || "User"}
                          />
                        ) : (
                          <AvatarFallback>
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.profile?.full_name || t('anonymous')}</p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <MentionInput
                      placeholder={t('write_comment')}
                      value={commentContent}
                      onChange={setCommentContent}
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => addComment.mutate()}
                        disabled={!commentContent.trim() || addComment.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {t('comment')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
                </CardContent>
              </Card>
            ))}

            {posts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {selectedHashtag 
                    ? t('no_posts_with_hashtag', { hashtag: selectedHashtag })
                    : t('no_posts_yet')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Messages, Suggested Users & Trending Hashtags */}
        <div className="hidden lg:block space-y-6">
          <MessagesSidebar />
          
          <SuggestedUsers />
          
          {/* Groups Quick Access */}
          <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('fitness_groups')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('join_groups_enthusiasts')}
              </p>
              <Button 
                onClick={() => navigate('/groups')} 
                className="w-full"
                variant="secondary"
              >
                {t('browse_groups')}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('trending_hashtags')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingHashtags && trendingHashtags.length > 0 ? (
                trendingHashtags.map(({ hashtag, count }) => (
                  <button
                    key={hashtag}
                    onClick={() => handleHashtagClick(hashtag)}
                    className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{hashtag}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count} {t('posts').toLowerCase()}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('no_trending_hashtags')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('report_post')}</DialogTitle>
            <DialogDescription>
              {t('help_understand_wrong')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('reason')}</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_reason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">{t('spam')}</SelectItem>
                  <SelectItem value="harassment">{t('harassment')}</SelectItem>
                  <SelectItem value="hate">{t('hate_speech')}</SelectItem>
                  <SelectItem value="violence">{t('violence')}</SelectItem>
                  <SelectItem value="misinformation">{t('misinformation')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('additional_details')}</label>
              <Textarea
                placeholder={t('tell_us_more')}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button
                onClick={() => reportPost.mutate()}
                disabled={!reportReason || reportPost.isPending}
              >
                {reportPost.isPending ? t('submitting') : t('submit_report')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feed;
