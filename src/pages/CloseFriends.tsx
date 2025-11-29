import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Search, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

const CloseFriends = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [closeFriends, setCloseFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUser(user);

      // Fetch close friends
      const { data: closeFriendsData } = await supabase
        .from('close_friends')
        .select(`
          id,
          friend_user_id,
          profiles!close_friends_friend_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      // Fetch followers with their profiles
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (followsError) {
        console.error('Error fetching follows:', followsError);
      }

      // Fetch profile data for each follower
      let followersWithProfiles: any[] = [];
      if (followsData && followsData.length > 0) {
        const followerIds = followsData.map(f => f.follower_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', followerIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        followersWithProfiles = followsData.map(follow => ({
          follower_id: follow.follower_id,
          profiles: profilesData?.find(p => p.id === follow.follower_id) || null
        })).filter(f => f.profiles !== null);
      }

      setCloseFriends(closeFriendsData || []);
      setFollowers(followersWithProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const addToCloseFriends = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('close_friends')
        .insert({
          user_id: currentUser.id,
          friend_user_id: friendId
        });

      if (error) throw error;

      toast.success("Added to close friends");
      fetchData();
    } catch (error) {
      console.error('Error adding to close friends:', error);
      toast.error("Failed to add to close friends");
    }
  };

  const removeFromCloseFriends = async (closeFriendId: string) => {
    try {
      const { error } = await supabase
        .from('close_friends')
        .delete()
        .eq('id', closeFriendId);

      if (error) throw error;

      toast.success("Removed from close friends");
      fetchData();
    } catch (error) {
      console.error('Error removing from close friends:', error);
      toast.error("Failed to remove from close friends");
    }
  };

  const isCloseFriend = (userId: string) => {
    return closeFriends.some(cf => cf.profiles.id === userId);
  };

  const getCloseFriendId = (userId: string) => {
    return closeFriends.find(cf => cf.profiles.id === userId)?.id;
  };

  const filteredFollowers = followers.filter(follow => {
    const profile = follow.profiles;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(query) ||
      profile.username?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            Close Friends
          </h1>
          <p className="text-muted-foreground">
            Share stories with your closest friends
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {closeFriends.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What are Close Friends?</CardTitle>
          <CardDescription>
            When you share a story marked as "Close Friends Only", only the people on this list will be able to see it. 
            Your close friends list is private - nobody else can see who's on it.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Close Friends */}
      {closeFriends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Close Friends</CardTitle>
            <CardDescription>
              {closeFriends.length} {closeFriends.length === 1 ? 'person' : 'people'} in your close friends list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {closeFriends.map((cf) => (
                <div key={cf.id} className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => navigate(`/profile/${cf.profiles.id}`)}
                  >
                    <Avatar>
                      <AvatarImage src={cf.profiles.avatar_url} />
                      <AvatarFallback>
                        {cf.profiles.full_name?.[0] || cf.profiles.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {cf.profiles.full_name || cf.profiles.username}
                        <Heart className="w-4 h-4 text-primary fill-primary" />
                      </p>
                      <p className="text-sm text-muted-foreground">@{cf.profiles.username}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCloseFriends(cf.id)}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add from Followers */}
      <Card>
        <CardHeader>
          <CardTitle>Add from Followers</CardTitle>
          <CardDescription>
            Add people who follow you to your close friends list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search followers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredFollowers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery ? "No followers found" : "No followers yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredFollowers.map((follow) => {
                const profile = follow.profiles;
                const isCF = isCloseFriend(profile.id);
                
                return (
                  <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/profile/${profile.id}`)}
                    >
                      <Avatar>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          {profile.full_name?.[0] || profile.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {profile.full_name || profile.username}
                        </p>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      </div>
                    </div>
                    {isCF ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCloseFriends(getCloseFriendId(profile.id)!)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => addToCloseFriends(profile.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CloseFriends;
