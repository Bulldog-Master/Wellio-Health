import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Lock, Globe, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Groups = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("members_count", { ascending: false });
      
      if (error) throw error;

      // Fetch creator profiles
      if (!data || data.length === 0) return [];

      const creatorIds = [...new Set(data.map(g => g.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", creatorIds);

      return data.map(group => ({
        ...group,
        creator: profiles?.find(p => p.id === group.creator_id)
      }));
    },
  });

  const { data: myMemberships } = useQuery({
    queryKey: ["my-groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map(m => m.group_id);
    },
  });

  const createGroup = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          description: groupDescription,
          creator_id: user.id,
          is_private: isPrivate,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;
      return group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setCreateDialogOpen(false);
      setGroupName("");
      setGroupDescription("");
      setIsPrivate(false);
      toast({ title: "Group created!" });
      navigate(`/groups/${group.id}`);
    },
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({ title: "Joined group!" });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Groups
          </h1>
          <p className="text-muted-foreground">Connect with communities that share your interests</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input
                  placeholder="e.g., Morning Runners"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="What's your group about?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="private-group">Private Group</Label>
                <Switch
                  id="private-group"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
              <Button
                onClick={() => createGroup.mutate()}
                disabled={!groupName.trim() || createGroup.isPending}
                className="w-full"
              >
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.map((group) => {
          const isMember = myMemberships?.includes(group.id);
          
          return (
            <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader onClick={() => navigate(`/groups/${group.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {group.name}
                      {group.is_private && <Lock className="w-4 h-4" />}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {group.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                    <span className="text-sm text-muted-foreground">
                      by {group.creator?.full_name || "Anonymous"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {group.is_private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {group.members_count} {group.members_count === 1 ? "member" : "members"}
                    </Badge>
                    
                    {isMember ? (
                      <Badge>Member</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinGroup.mutate(group.id);
                        }}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {groups?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No groups yet. Create the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
