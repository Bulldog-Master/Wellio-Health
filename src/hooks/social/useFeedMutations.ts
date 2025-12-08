import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";
import { useTranslation } from "react-i18next";

interface CreatePostParams {
  postContent: string;
  uploadedImage: File | null;
  uploadedVideo: File | null;
}

interface UseFeedMutationsProps {
  userLikes?: string[];
  onPostCreated: () => void;
}

export const useFeedMutations = ({ userLikes, onPostCreated }: UseFeedMutationsProps) => {
  const { toast } = useToast();
  const { t } = useTranslation(['social', 'feed']);
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async ({ postContent, uploadedImage, uploadedVideo }: CreatePostParams) => {
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
      onPostCreated();
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
      await queryClient.cancelQueries({ queryKey: ["feed-posts"] });
      await queryClient.cancelQueries({ queryKey: ["user-post-likes"] });

      const previousPosts = queryClient.getQueryData(["feed-posts"]);
      const previousLikes = queryClient.getQueryData(["user-post-likes"]);

      queryClient.setQueryData(["user-post-likes"], (old: string[] | undefined) => {
        if (!old) return old;
        const isLiked = old.includes(postId);
        return isLiked ? old.filter(id => id !== postId) : [...old, postId];
      });

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
    onError: (err: Error, postId, context) => {
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-post-likes"] });
    },
  });

  const toggleBookmark = useMutation({
    mutationFn: async ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
    onSuccess: (_, { isBookmarked }) => {
      queryClient.invalidateQueries({ queryKey: ["user-bookmarks"] });
      toast({
        title: isBookmarked ? t('bookmark_removed') : t('bookmark_added'),
      });
    },
  });

  const addReaction = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Remove existing reaction first
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      // Add new reaction
      const { error } = await supabase
        .from("reactions")
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reactions"] });
      queryClient.invalidateQueries({ queryKey: ["reactions-counts"] });
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Rate limiting for comments
      const rateLimitKey = `comment:${user.id}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.COMMENT_CREATE);

      if (!rateLimit.allowed) {
        throw new Error(`Commenting too quickly. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)} seconds.`);
      }

      const { error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast({ title: t('comment_added') });
    },
  });

  const blockUser = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("blocked_users")
        .insert({
          user_id: user.id,
          blocked_user_id: blockedUserId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast({ title: t('user_blocked') });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("posts")
        .update({ content, edited_at: new Date().toISOString() })
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast({ title: t('post_updated') });
    },
  });

  const reportPost = useMutation({
    mutationFn: async ({ postId, reason, details }: { postId: string; reason: string; details: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("post_reports")
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason,
          details,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: t('report_submitted') });
    },
  });

  return {
    createPost,
    toggleLike,
    toggleBookmark,
    addReaction,
    addComment,
    blockUser,
    updatePost,
    reportPost,
  };
};
