import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Send, User, ArrowLeft, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
      
      if (error) throw error;

      const { data: creator } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", data.creator_id)
        .single();

      return { ...data, creator };
    },
    enabled: !!groupId,
  });

  const { data: isMember } = useQuery({
    queryKey: ["is-group-member", groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!groupId,
  });

  const { data: posts } = useQuery({
    queryKey: ["group-posts", groupId],
    queryFn: async () => {
      const { data: groupPosts, error } = await supabase
        .from("group_posts")
        .select("post_id")
        .eq("group_id", groupId);
      
      if (error) throw error;

      const postIds = groupPosts.map(gp => gp.post_id);
      if (postIds.length === 0) return [];

      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (!postsData) return [];

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
    enabled: !!groupId && !!isMember,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent,
          post_type: "text",
          is_public: false,
        })
        .select()
        .single();

      if (postError) throw postError;

      const { error: groupPostError } = await supabase
        .from("group_posts")
        .insert({
          group_id: groupId,
          post_id: post.id,
        });

      if (groupPostError) throw groupPostError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      setPostContent("");
      toast({ title: "Post created!" });
    },
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-group-member", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast({ title: "Joined group!" });
    },
  });

  if (!group) return <div className="container mx-auto p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/groups")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Groups
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                {group.name}
                {group.is_private ? <Lock className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
              </h1>
              <p className="text-muted-foreground mb-4">{group.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    {group.creator?.avatar_url ? (
                      <AvatarImage src={group.creator.avatar_url} />
                    ) : (
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm">Created by {group.creator?.full_name || "Anonymous"}</span>
                </div>
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {group.members_count} {group.members_count === 1 ? "member" : "members"}
                </Badge>
              </div>
            </div>
            {!isMember && (
              <Button onClick={() => joinGroup.mutate()}>Join Group</Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {isMember && (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              <Textarea
                placeholder="Share something with the group..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => createPost.mutate()}
                  disabled={!postContent.trim() || createPost.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createPost.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {posts?.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {post.profile?.avatar_url ? (
                        <AvatarImage src={post.profile.avatar_url} />
                      ) : (
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.profile?.full_name || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))}

            {posts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupDetail;
