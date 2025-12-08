import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const SuggestedUsers = () => {
  const { t } = useTranslation('social');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: followingIds = [], refetch: refetchFollowing } = useQuery({
    queryKey: ["user-following", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUser.id);

      return data?.map(f => f.following_id) || [];
    },
    enabled: !!currentUser,
    staleTime: 0,
  });

  const { data: suggestedUsers } = useQuery({
    queryKey: ["suggested-users", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, goal, fitness_level, followers_count")
        .neq("id", currentUser.id)
        .not("id", "is", null)
        .order("total_points", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching suggested users:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!currentUser,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleToggleFollow = async (userId: string) => {
    if (!currentUser) return;

    const isFollowing = followingIds.includes(userId);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);

        if (error) throw error;
        
        toast({ title: t('unfollowed') });
      } else {
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
          toast({ title: t('follow_request_sent') });
        } else {
          const { error } = await supabase
            .from("follows")
            .insert({
              follower_id: currentUser.id,
              following_id: userId
            });

          if (error) throw error;
          toast({ title: t('now_following') });
        }
      }
      
      // Force refetch immediately
      await refetchFollowing();
      await queryClient.invalidateQueries({ 
        queryKey: ["user-following"], 
        refetchType: 'active' 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["suggested-users"],
        refetchType: 'active'
      });
    } catch (error) {
      console.error("Toggle follow error:", error);
      toast({ 
        title: "Error", 
        description: isFollowing ? "Could not unfollow user" : "Could not follow user", 
        variant: "destructive" 
      });
    }
  };

  if (!suggestedUsers || suggestedUsers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('suggested_for_you')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map((user) => {
          const isFollowing = followingIds.includes(user.id);
          
          return (
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
                  {user.goal || user.fitness_level || `${user.followers_count} ${t('followers')}`}
                </p>
              </div>
              <Button
                size="sm"
                variant={isFollowing ? "secondary" : "outline"}
                onClick={() => handleToggleFollow(user.id)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                {isFollowing ? t('following') : t('follow')}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
