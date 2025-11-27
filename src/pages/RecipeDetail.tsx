import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Users, Share2, Copy, MessageSquare, History, GitFork } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  category: string;
  image_url: string;
  user_id: string;
  is_collaborative: boolean;
  is_public: boolean;
  allow_remixing: boolean;
  version_number: number;
}

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface Collaborator {
  id: string;
  collaborator_id: string;
  role: string;
  accepted: boolean;
  profiles?: {
    username: string;
  };
}

const RecipeDetail = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newComment, setNewComment] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUserId(user.id);
      
      await fetchRecipe();
      await fetchComments();
      await fetchCollaborators();
      setupRealtimeSubscriptions();
    };

    initData();
  }, [recipeId]);

  const setupRealtimeSubscriptions = () => {
    const commentsChannel = supabase
      .channel(`recipe-comments-${recipeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'recipe_comments',
        filter: `recipe_id=eq.${recipeId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    const collabChannel = supabase
      .channel(`recipe-collab-${recipeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'recipe_collaborations',
        filter: `recipe_id=eq.${recipeId}`
      }, () => {
        fetchCollaborators();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(collabChannel);
    };
  };

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast({
        title: "Error",
        description: "Failed to load recipe",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_comments')
        .select('*')
        .eq('recipe_id', recipeId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profiles: profilesData?.find(p => p.id === comment.user_id)
        }));

        setComments(commentsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_collaborations')
        .select('*')
        .eq('recipe_id', recipeId);

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = data.map(c => c.collaborator_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const collabsWithProfiles = data.map(collab => ({
          ...collab,
          profiles: profilesData?.find(p => p.id === collab.collaborator_id)
        }));

        setCollaborators(collabsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('recipe_comments')
        .insert([{
          recipe_id: recipeId,
          user_id: currentUserId,
          comment: newComment,
        }]);

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const inviteCollaborator = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', inviteEmail)
        .single();

      if (!profileData) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('recipe_collaborations')
        .insert([{
          recipe_id: recipeId,
          collaborator_id: profileData.id,
          invited_by: currentUserId,
          role: inviteRole,
        }]);

      if (error) throw error;

      setInviteEmail("");
      toast({
        title: "Success",
        description: "Collaboration invite sent",
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        toast({
          title: "Already invited",
          description: "This user is already a collaborator",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to invite collaborator",
          variant: "destructive",
        });
      }
    }
  };

  const remixRecipe = async () => {
    if (!recipe) return;

    try {
      const { data: newRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([{
          user_id: currentUserId,
          name: `${recipe.name} (Remix)`,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          category: recipe.category,
          is_public: true,
          allow_remixing: true,
        }])
        .select()
        .single();

      if (recipeError) throw recipeError;

      await supabase
        .from('recipe_remixes')
        .insert([{
          original_recipe_id: recipeId,
          remixed_recipe_id: newRecipe.id,
          remix_notes: "Remixed from original recipe"
        }]);

      toast({
        title: "Success",
        description: "Recipe remixed! Redirecting...",
      });

      setTimeout(() => navigate(`/recipe/${newRecipe.id}`), 1000);
    } catch (error) {
      console.error('Error remixing recipe:', error);
      toast({
        title: "Error",
        description: "Failed to remix recipe",
        variant: "destructive",
      });
    }
  };

  if (!recipe) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <p>Loading recipe...</p>
        </div>
      </Layout>
    );
  }

  const isOwner = recipe.user_id === currentUserId;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/food/recipes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{recipe.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">{recipe.description}</p>
                    <Badge className="mt-2">{recipe.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {recipe.allow_remixing && (
                      <Button variant="outline" onClick={remixRecipe}>
                        <GitFork className="mr-2 h-4 w-4" />
                        Remix
                      </Button>
                    )}
                    {isOwner && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            Collaborate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite Collaborator</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Username"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={inviteCollaborator} className="w-full">
                              Send Invite
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {recipe.image_url && (
                  <img src={recipe.image_url} alt={recipe.name} className="w-full h-64 object-cover rounded-lg" />
                )}

                <div>
                  <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
                  <div className="whitespace-pre-line">
                    {recipe.ingredients || 'No ingredients listed'}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                  <p className="whitespace-pre-line">{recipe.instructions || 'No instructions provided'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button onClick={addComment}>Post</Button>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 border rounded">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{comment.profiles?.username || 'Unknown'}</p>
                            <p className="text-sm mt-1">{comment.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {collaborators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Collaborators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {(collab.profiles?.username || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{collab.profiles?.username || 'Unknown'}</span>
                        </div>
                        <Badge variant={collab.accepted ? "default" : "outline"}>
                          {collab.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Share Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Public Recipe</span>
                  <Badge variant={recipe.is_public ? "default" : "secondary"}>
                    {recipe.is_public ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allow Remixing</span>
                  <Badge variant={recipe.allow_remixing ? "default" : "secondary"}>
                    {recipe.allow_remixing ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Version</span>
                  <Badge variant="outline">v{recipe.version_number}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeDetail;