import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { rateLimiter, RATE_LIMITS } from "@/lib/features";

export const useSearch = () => {
  const { toast } = useToast();
  const { t } = useTranslation('search');
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Search users
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, total_points, current_streak, followers_count, following_count")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq("id", currentUserId || "")
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Get user's follows
  const { data: userFollows } = useQuery({
    queryKey: ["user-follows"],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      if (error) throw error;
      return data.map((f) => f.following_id);
    },
    enabled: !!currentUserId,
  });

  const toggleFollow = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUserId) throw new Error("Not authenticated");

      const rateLimitKey = `follow:${currentUserId}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.FOLLOW_ACTION);

      if (!rateLimit.allowed) {
        throw new Error(`Too many follow actions. Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes.`);
      }

      const isFollowing = userFollows?.includes(userId);

      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: userId });
        if (error) throw error;
      }
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ["user-follows"] });
      const previousFollows = queryClient.getQueryData(["user-follows"]);

      queryClient.setQueryData(["user-follows"], (old: string[] | undefined) => {
        if (!old) return old;
        const isFollowing = old.includes(userId);
        return isFollowing ? old.filter(id => id !== userId) : [...old, userId];
      });

      return { previousFollows };
    },
    onError: (err, userId, context) => {
      if (context?.previousFollows) {
        queryClient.setQueryData(["user-follows"], context.previousFollows);
      }
      toast({
        title: t('error'),
        description: err.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-follows"] });
      queryClient.invalidateQueries({ queryKey: ["user-search"] });
      toast({ title: t('follow_status_updated') });
    },
  });

  // Get top users
  const { data: topUsers } = useQuery({
    queryKey: ["top-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, total_points, current_streak, followers_count")
        .neq("id", currentUserId || "")
        .order("total_points", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Search posts
  const { data: searchPosts } = useQuery({
    queryKey: ["post-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name, avatar_url)")
        .ilike("content", `%${searchQuery}%`)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Search hashtags
  const { data: searchHashtags } = useQuery({
    queryKey: ["hashtag-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from("post_hashtags")
        .select("hashtag, post_id")
        .ilike("hashtag", `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      const hashtagCounts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.hashtag] = (acc[curr.hashtag] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: searchQuery.trim().length > 0,
  });

  const isFollowing = (userId: string) => userFollows?.includes(userId);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    searchResults,
    isLoading,
    topUsers,
    searchPosts,
    searchHashtags,
    isFollowing,
    toggleFollow: toggleFollow.mutate,
  };
};
