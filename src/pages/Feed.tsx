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
import { Heart, MessageCircle, Send, Image as ImageIcon, User, X, Hash, TrendingUp, Share2, Copy, Check, Bookmark, Edit, MoreVertical, Flag, UserX, ArrowLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MentionInput } from "@/components/MentionInput";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import { MessagesSidebar } from "@/components/MessagesSidebar";
import { LazyImage } from "@/components/LazyImage";

const Feed = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedHashtag = searchParams.get("hashtag");
  const [postContent, setPostContent] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      let mediaUrl = null;

      // Upload image if present
      if (uploadedImage) {
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
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent,
          post_type: mediaUrl ? "image" : "text",
          media_url: mediaUrl,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setPostContent("");
      setUploadedImage(null);
      setImagePreview(null);
      toast({ title: "Post created!" });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      toast({ title: "Link copied to clipboard!" });
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
      toast({ title: "Bookmark updated" });
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
      toast({ title: "Post updated!" });
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
      toast({ title: "Report submitted", description: "Thank you for helping keep our community safe." });
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
      toast({ title: "User blocked" });
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
                onClick={() => navigate("/")}
                className="hover:bg-primary/10"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Community Feed</h1>
                  <p className="text-muted-foreground mt-1">Share your fitness journey with the community</p>
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
                  Clear filter
                </Button>
              </div>
            )}
          </div>

          {/* Create Post */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6 space-y-4">
              <MentionInput
                placeholder="Share your progress, achievements, or motivation... Use #hashtags and @mentions!"
                value={postContent}
                onChange={setPostContent}
                rows={3}
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
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={createPost.isPending}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
            <Button
              onClick={() => createPost.mutate()}
              disabled={(!postContent.trim() && !uploadedImage) || createPost.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {createPost.isPending ? "Posting..." : "Post"}
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
                          {post.profile?.full_name || "Anonymous"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          {post.edited_at && " (edited)"}
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
                            Edit Post
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => handleReportPost(post.id)}>
                              <Flag className="w-4 h-4 mr-2" />
                              Report Post
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => blockUser.mutate(post.user_id)}
                              className="text-destructive"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Block User
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
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{renderContentWithHashtags(post.content)}</p>
                  )}

              {post.media_url && (
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
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'copy')}>
                        {copiedPostId === post.id ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'twitter')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Share on X
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'facebook')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Share on Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSharePost(post.id, 'linkedin')}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Share on LinkedIn
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
                        <p className="font-semibold text-sm">{comment.profile?.full_name || "Anonymous"}</p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <MentionInput
                      placeholder="Write a comment..."
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
                        Comment
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
                    ? `No posts found with #${selectedHashtag}` 
                    : "No posts yet. Be the first to share!"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Active Conversations & Trending Hashtags */}
        <div className="hidden lg:block space-y-6">
          <MessagesSidebar />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Hashtags
              </CardTitle>
            </CardHeader>
...
          </Card>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Help us understand what's wrong with this post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="hate">Hate Speech</SelectItem>
                  <SelectItem value="violence">Violence</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional Details</label>
              <Textarea
                placeholder="Tell us more about the issue..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => reportPost.mutate()}
                disabled={!reportReason || reportPost.isPending}
              >
                {reportPost.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feed;
