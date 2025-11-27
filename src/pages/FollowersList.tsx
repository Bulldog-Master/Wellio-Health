import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserPlus, UserCheck, Trophy, TrendingUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FollowersList = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, followers_count, following_count")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch followers
  const { data: followers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data: followData, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (error) throw error;

      if (!followData || followData.length === 0) return [];

      const followerIds = followData.map((f) => f.follower_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, total_points, current_streak, followers_count")
        .in("id", followerIds);

      if (profilesError) throw profilesError;
      return profiles;
    },
    enabled: !!userId,
  });

  // Fetch following
  const { data: following } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data: followData, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (error) throw error;

      if (!followData || followData.length === 0) return [];

      const followingIds = followData.map((f) => f.following_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, total_points, current_streak, followers_count")
        .in("id", followingIds);

      if (profilesError) throw profilesError;
      return profiles;
    },
    enabled: !!userId,
  });

  // Get current user's follows
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
    mutationFn: async (targetUserId: string) => {
      if (!currentUserId) throw new Error("Not authenticated");

      const isFollowing = userFollows?.includes(targetUserId);

      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-follows"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      toast({ title: "Follow status updated" });
    },
  });

  const isFollowing = (targetUserId: string) => userFollows?.includes(targetUserId);

  const renderUserCard = (user: any) => (
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
          {currentUserId !== user.id && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/user/${userId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {profile?.full_name || "User"}'s Connections
          </h1>
          <p className="text-muted-foreground">
            {profile?.followers_count || 0} followers · {profile?.following_count || 0} following
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "followers" | "following")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers">
            Followers ({followers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({following?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="space-y-3 mt-6">
          {followers && followers.length > 0 ? (
            followers.map((user) => renderUserCard(user))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No followers yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-3 mt-6">
          {following && following.length > 0 ? (
            following.map((user) => renderUserCard(user))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Not following anyone yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowersList;
