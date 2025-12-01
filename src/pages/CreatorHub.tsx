import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Eye, Heart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreatorHub = () => {
  const { toast } = useToast();
  const { t } = useTranslation('creator');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch creator stats
  const { data: stats } = useQuery({
    queryKey: ["creator-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [contentData, subscribersData] = await Promise.all([
        supabase
          .from("creator_content")
          .select("views_count, likes_count")
          .eq("creator_id", user.id),
        supabase
          .from("creator_subscriptions")
          .select("id")
          .eq("creator_id", user.id),
      ]);

      const totalViews = contentData.data?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0;
      const totalLikes = contentData.data?.reduce((sum, c) => sum + (c.likes_count || 0), 0) || 0;

      return {
        totalContent: contentData.data?.length || 0,
        totalViews,
        totalLikes,
        totalFollowers: subscribersData.data?.length || 0,
      };
    },
  });

  // Fetch creator content
  const { data: content } = useQuery({
    queryKey: ["creator-content"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("creator_content")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from("creator_content")
        .update({ is_published: !isPublished })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-content"] });
      toast({ title: t('content_updated') });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('creator_hub')}</h1>
          <p className="text-muted-foreground">{t('manage_content')}</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('create_content')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_content')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContent || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('followers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFollowers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_views')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_likes')}</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLikes || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="content">{t('my_content')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('getting_started')}</CardTitle>
              <CardDescription>{t('getting_started_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('welcome_message')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content?.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant={item.is_published ? "default" : "secondary"}>
                      {item.is_published ? t('published') : t('draft')}
                    </Badge>
                  </div>
                  <CardDescription className="capitalize">{item.content_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
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
                    variant="outline"
                    className="w-full"
                    onClick={() => togglePublish.mutate({ id: item.id, isPublished: item.is_published })}
                  >
                    {item.is_published ? t('unpublish') : t('publish')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics')}</CardTitle>
              <CardDescription>{t('track_performance')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('analytics_coming_soon')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorHub;
