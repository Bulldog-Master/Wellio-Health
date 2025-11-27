import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Users, Trophy, Flame, ArrowLeft, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's posts
  const { data: posts } = useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Check if current user follows this profile
  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", userId],
    queryFn: async () => {
      if (!currentUser || currentUser.id === userId) return false;

      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!currentUser && currentUser.id !== userId,
  });

  // Fetch user's badges
  const { data: badges } = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Not authenticated");

      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: userId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast({ title: isFollowing ? "Unfollowed" : "Following!" });
    },
  });

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/feed")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="w-24 h-24">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile?.full_name || "Anonymous"}</h1>
                {profile?.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
              </div>

              <div className="flex gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold">{posts?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.followers_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.following_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              <div className="flex gap-2 justify-center md:justify-start">
                {isOwnProfile ? (
                  <Button onClick={() => navigate("/profile")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={() => toggleFollow.mutate()}
                    variant={isFollowing ? "outline" : "default"}
                    disabled={toggleFollow.isPending}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-warning" />
                <span className="font-bold">{profile?.total_points || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-destructive" />
                <span className="font-bold">{profile?.current_streak || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-success" />
                <span className="font-bold">{badges?.length || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                  <Badge variant="secondary" className="capitalize">
                    {post.post_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{post.content}</p>

                {post.media_url && (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="rounded-lg w-full object-cover max-h-96"
                  />
                )}

                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {posts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges?.map((badge) => (
              <Card key={badge.id} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{badge.badge_icon || "🏆"}</div>
                  <h3 className="font-semibold">{badge.badge_name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.badge_description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Earned {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {badges?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No badges earned yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
