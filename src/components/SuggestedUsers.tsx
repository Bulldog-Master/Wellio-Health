import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const SuggestedUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: suggestedUsers } = useQuery({
    queryKey: ["suggested-users", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      // Get users you're already following
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      const followingIds = following?.map(f => f.following_id) || [];

      // Get suggested users based on:
      // 1. Similar fitness goals
      // 2. Similar fitness level
      // 3. Active users
      // 4. Not already following
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("goal, fitness_level")
        .eq("id", currentUser.id)
        .single();

      let query = supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, goal, fitness_level, followers_count")
        .neq("id", currentUser.id)
        .not("id", "in", `(${followingIds.join(",")})`)
        .limit(5);

      // Prioritize users with similar goals or fitness level
      if (userProfile?.goal) {
        query = query.or(`goal.eq.${userProfile.goal},fitness_level.eq.${userProfile.fitness_level}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser,
  });

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      // Check if profile is private - create follow request instead
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("is_private")
        .eq("id", userId)
        .single();

      if (targetProfile?.is_private) {
        const { error } = await supabase
          .from("follow_requests")
          .insert({
            requester_id: currentUser.id,
            requested_id: userId
          });

        if (error) throw error;
        toast({ title: "Follow request sent!" });
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          });

        if (error) throw error;
        toast({ title: "Now following!" });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Could not follow user", 
        variant: "destructive" 
      });
    }
  };

  if (!suggestedUsers || suggestedUsers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suggested For You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Avatar 
              className="cursor-pointer"
              onClick={() => navigate(`/user/${user.id}`)}
            >
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
              ) : (
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              )}
            </Avatar>
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/user/${user.id}`)}
            >
              <p className="font-semibold text-sm hover:underline">
                {user.full_name || user.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.goal || user.fitness_level || `${user.followers_count} followers`}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFollow(user.id)}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Follow
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
