import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Image as ImageIcon, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Feed = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch posts with user profiles
  const { data: posts } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user profiles
      if (!postsData || postsData.length === 0) return [];

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
  });

  // Fetch user's likes
  const { data: userLikes } = useQuery({
    queryKey: ["user-post-likes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(like => like.post_id);
    },
  });

  // Fetch comments for selected post
  const { data: comments } = useQuery({
    queryKey: ["post-comments", selectedPostId],
    queryFn: async () => {
      if (!selectedPostId) return [];

      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", selectedPostId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch user profiles for comments
      if (!commentsData || commentsData.length === 0) return [];

      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return commentsData.map(comment => ({
        ...comment,
        profile: profiles?.find(p => p.id === comment.user_id)
      }));
    },
    enabled: !!selectedPostId,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let mediaUrl = null;

      // Upload image if present
      if (uploadedImage) {
        const fileExt = uploadedImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, uploadedImage);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

        mediaUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent,
          post_type: mediaUrl ? "image" : "text",
          media_url: mediaUrl,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setPostContent("");
      setUploadedImage(null);
      setImagePreview(null);
      toast({ title: "Post created!" });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isLiked = userLikes?.includes(postId);

      if (isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-post-likes"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!selectedPostId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: selectedPostId,
          content: commentContent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", selectedPostId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setCommentContent("");
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Feed</h1>
        <p className="text-muted-foreground">Share your fitness journey with the community</p>
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="Share your progress, achievements, or motivation..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={3}
          />
          
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={createPost.isPending}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
            <Button
              onClick={() => createPost.mutate()}
              disabled={(!postContent.trim() && !uploadedImage) || createPost.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar 
                  className="cursor-pointer"
                  onClick={() => navigate(`/user/${post.user_id}`)}
                >
                  {post.profile?.avatar_url ? (
                    <AvatarImage src={post.profile.avatar_url} alt={post.profile.full_name || "User"} />
                  ) : (
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p 
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() => navigate(`/user/${post.user_id}`)}
                  >
                    {post.profile?.full_name || "Anonymous"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
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

              <div className="flex items-center gap-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike.mutate(post.id)}
                  className={userLikes?.includes(post.id) ? "text-red-500" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-1 ${userLikes?.includes(post.id) ? "fill-current" : ""}`}
                  />
                  {post.likes_count}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments_count}
                </Button>
              </div>

              {/* Comments Section */}
              {selectedPostId === post.id && (
                <div className="space-y-3 pt-3 border-t">
                  {comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        {comment.profile?.avatar_url ? (
                          <AvatarImage
                            src={comment.profile.avatar_url}
                            alt={comment.profile.full_name || "User"}
                          />
                        ) : (
                          <AvatarFallback>
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.profile?.full_name || "Anonymous"}</p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          addComment.mutate();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => addComment.mutate()}
                      disabled={!commentContent.trim() || addComment.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {posts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
