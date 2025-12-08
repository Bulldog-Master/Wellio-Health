import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PostWithProfile {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  media_url: string | null;
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  edited_at: string | null;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface TrendingHashtag {
  hashtag: string;
  count: number;
}

export interface CommentWithProfile {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useFeedData = (selectedHashtag: string | null, selectedPostId: string | null) => {
  // Fetch posts with user profiles
  const { data: posts } = useQuery({
    queryKey: ["feed-posts", selectedHashtag],
    queryFn: async (): Promise<PostWithProfile[]> => {
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
    queryFn: async (): Promise<TrendingHashtag[]> => {
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
    queryFn: async (): Promise<string[]> => {
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
    queryFn: async (): Promise<string[]> => {
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
    queryFn: async (): Promise<Record<string, string>> => {
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
    queryFn: async (): Promise<Record<string, Record<string, number>>> => {
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
    queryFn: async (): Promise<CommentWithProfile[]> => {
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

  return {
    posts,
    trendingHashtags,
    userLikes,
    userBookmarks,
    currentUser,
    userReactions,
    reactionsCounts,
    comments,
  };
};
