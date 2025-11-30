import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, User, UserPlus, UserCheck, Trophy, TrendingUp, Hash, FileText, Heart, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  });

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

      // Rate limiting for follow actions
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

      // Optimistically update follows
      queryClient.setQueryData(["user-follows"], (old: string[] | undefined) => {
        if (!old) return old;
        const isFollowing = old.includes(userId);
        return isFollowing ? old.filter(id => id !== userId) : [...old, userId];
      });

      return { previousFollows };
    },
    onError: (err, userId, context) => {
      // Rollback on error
      if (context?.previousFollows) {
        queryClient.setQueryData(["user-follows"], context.previousFollows);
      }
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-follows"] });
      queryClient.invalidateQueries({ queryKey: ["user-search"] });
      toast({ title: "Follow status updated" });
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

      // Group by hashtag and count occurrences
      const hashtagCounts = data.reduce((acc: any, curr) => {
        acc[curr.hashtag] = (acc[curr.hashtag] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a: any, b: any) => b.count - a.count);
    },
    enabled: searchQuery.trim().length > 0,
  });

  const isFollowing = (userId: string) => userFollows?.includes(userId);

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search & Discover</h1>
        <p className="text-muted-foreground">Find users, posts, and trending topics</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search users, posts, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results with Tabs */}
      {searchQuery.trim() && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="gap-2">
              <User className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="gap-2">
              <Hash className="h-4 w-4" />
              Hashtags
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Searching...</p>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <Card key={user.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback>
                            {user.full_name?.[0] || user.username?.[0] || <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user.full_name || "Anonymous"}</p>
                          {user.username && (
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              {user.total_points} pts
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {user.current_streak} day streak
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {user.followers_count} followers
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isFollowing(user.id) ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleFollow.mutate(user.id)}
                      >
                        {isFollowing(user.id) ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No users found matching "{searchQuery}"
              </CardContent>
            </Card>
          )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            {searchPosts && searchPosts.length > 0 ? (
              <div className="space-y-3">
                {searchPosts.map((post: any) => (
                  <Card 
                    key={post.id} 
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/feed`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.profiles?.avatar_url || ""} />
                          <AvatarFallback>
                            {post.profiles?.full_name?.[0] || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{post.profiles?.full_name || "Anonymous"}</p>
                            {post.profiles?.username && (
                              <p className="text-sm text-muted-foreground">@{post.profiles.username}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              • {format(new Date(post.created_at), "MMM dd")}
                            </p>
                          </div>
                          <p className="text-sm line-clamp-3">{post.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <span className="flex items-center gap-1 text-xs">
                              <Heart className="h-3 w-3" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments_count}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {post.post_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No posts found matching "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Hashtags Tab */}
          <TabsContent value="hashtags" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Hashtags</h2>
            {searchHashtags && searchHashtags.length > 0 ? (
              <div className="grid gap-3">
                {searchHashtags.map((item: any) => (
                  <Card 
                    key={item.hashtag}
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSearchQuery(item.hashtag);
                      setActiveTab("posts");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Hash className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">#{item.hashtag}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.count} {item.count === 1 ? 'post' : 'posts'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Posts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hashtags found matching "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Top Users */}
      {!searchQuery.trim() && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Users</h2>
          {topUsers && topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <Card key={user.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback>
                              {user.full_name?.[0] || user.username?.[0] || <User className="h-5 w-5" />}
                            </AvatarFallback>
                          </Avatar>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{user.full_name || "Anonymous"}</p>
                          {user.username && (
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              {user.total_points} pts
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {user.current_streak} day streak
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {user.followers_count} followers
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isFollowing(user.id) ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleFollow.mutate(user.id)}
                      >
                        {isFollowing(user.id) ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No users to display
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
