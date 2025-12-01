import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Bookmarks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('bookmarks');

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: bookmarksData, error } = await supabase
        .from("bookmarks")
        .select("*, posts(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for posts
      if (!bookmarksData || bookmarksData.length === 0) return [];

      const userIds = [...new Set(bookmarksData.map(b => b.posts.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return bookmarksData.map(bookmark => ({
        ...bookmark,
        posts: {
          ...bookmark.posts,
          profile: profiles?.find(p => p.id === bookmark.posts.user_id)
        }
      }));
    },
  });

  const removeBookmark = useMutation({
    mutationFn: async (bookmarkId: string) => {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);
      if (error) throw error;
    },
    onMutate: async (bookmarkId: string) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previousBookmarks = queryClient.getQueryData(["bookmarks"]);
      
      queryClient.setQueryData(["bookmarks"], (old: any) => 
        old ? old.filter((b: any) => b.id !== bookmarkId) : []
      );
      
      return { previousBookmarks };
    },
    onError: (_err, _bookmarkId, context) => {
      queryClient.setQueryData(["bookmarks"], context?.previousBookmarks);
      toast({ 
        title: t('failed_to_remove'), 
        description: t('please_try_again'),
        variant: "destructive" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast({ title: t('bookmark_removed') });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="w-8 h-8" />
          {t('saved_posts')}
        </h1>
        <p className="text-muted-foreground">{t('your_bookmarks')}</p>
      </div>

      {bookmarks?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('no_bookmarks_yet')}</p>
            <Button 
              variant="link" 
              onClick={() => navigate("/feed")}
              className="mt-2"
            >
              {t('explore_posts')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks?.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="cursor-pointer"
                      onClick={() => navigate(`/user/${bookmark.posts.user_id}`)}
                    >
                      {bookmark.posts.profile?.avatar_url ? (
                        <AvatarImage 
                          src={bookmark.posts.profile.avatar_url} 
                          alt={bookmark.posts.profile.full_name || t('user')} 
                        />
                      ) : (
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p 
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() => navigate(`/user/${bookmark.posts.user_id}`)}
                      >
                        {bookmark.posts.profile?.full_name || t('anonymous')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(bookmark.posts.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {bookmark.posts.post_type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBookmark.mutate(bookmark.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{bookmark.posts.content}</p>

                {bookmark.posts.media_url && (
                  <img
                    src={bookmark.posts.media_url}
                    alt="Post media"
                    className="rounded-lg w-full object-cover max-h-96"
                  />
                )}

                <div className="flex items-center gap-4 pt-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    {bookmark.posts.likes_count}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/feed")}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {bookmark.posts.comments_count}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
