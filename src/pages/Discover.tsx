import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Discover = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contentType, setContentType] = useState<string>("all");

  // Fetch published content with creator info
  const { data: content } = useQuery({
    queryKey: ["discover-content", contentType],
    queryFn: async () => {
      let query = supabase
        .from("creator_content")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (contentType !== "all") {
        query = query.eq("content_type", contentType);
      }

      const { data: contentData, error } = await query;
      if (error) throw error;

      // Fetch creator profiles separately
      if (!contentData || contentData.length === 0) return [];

      const creatorIds = [...new Set(contentData.map(c => c.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", creatorIds);

      // Merge profiles with content
      return contentData.map(item => ({
        ...item,
        profile: profiles?.find(p => p.id === item.creator_id)
      }));
    },
  });

  // Fetch user's likes
  const { data: userLikes } = useQuery({
    queryKey: ["user-likes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("content_likes")
        .select("content_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((like) => like.content_id);
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (contentId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isLiked = userLikes?.includes(contentId);

      if (isLiked) {
        const { error } = await supabase
          .from("content_likes")
          .delete()
          .eq("content_id", contentId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_likes")
          .insert({ content_id: contentId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-likes"] });
      queryClient.invalidateQueries({ queryKey: ["discover-content"] });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover</h1>
        <p className="text-muted-foreground">Explore workouts, recipes, and fitness content from creators</p>
      </div>

      <Tabs value={contentType} onValueChange={setContentType}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="workout">Workouts</TabsTrigger>
          <TabsTrigger value="recipe">Recipes</TabsTrigger>
          <TabsTrigger value="meal_plan">Meal Plans</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
        </TabsList>

        <TabsContent value={contentType} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content?.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                {item.thumbnail_url && (
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img src={item.thumbnail_url} alt={item.title} className="object-cover w-full h-full" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    {item.is_premium && <Badge variant="secondary">Premium</Badge>}
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {item.profile?.avatar_url ? (
                        <img
                          src={item.profile.avatar_url}
                          alt={item.profile.full_name || "Creator"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{item.profile?.full_name || "Anonymous"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {item.likes_count}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike.mutate(item.id)}
                      className={userLikes?.includes(item.id) ? "text-red-500" : ""}
                    >
                      <Heart className={`w-4 h-4 ${userLikes?.includes(item.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {content?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content available yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
