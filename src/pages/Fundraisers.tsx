import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, MapPin, Calendar, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const Fundraisers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch fundraisers
  const { data: fundraisers, isLoading } = useQuery({
    queryKey: ['fundraisers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          profiles!fundraisers_user_id_fkey(full_name, username, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create fundraiser mutation
  const createMutation = useMutation({
    mutationFn: async (fundraiserData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fundraisers')
        .insert({
          ...fundraiserData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundraisers'] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success!",
        description: "Your fundraiser has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGoalAmount("");
    setCategory("");
    setLocation("");
    setEndDate("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !goalAmount || !category || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      title,
      description,
      goal_amount: parseFloat(goalAmount),
      category,
      location: location || null,
      end_date: new Date(endDate).toISOString(),
    });
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      medical: "Medical",
      community_event: "Community Event",
      charity: "Charity",
      equipment: "Equipment",
      other: "Other"
    };
    return labels[cat] || cat;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ background: 'var(--gradient-hero)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Community Fundraisers
          </h1>
          <p className="text-muted-foreground">
            Support wellness causes and help your community thrive
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90" style={{ boxShadow: 'var(--shadow-glow)' }}>
              <Plus className="mr-2 h-4 w-4" />
              Start Fundraiser
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create a Fundraiser</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Help fund community fitness equipment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical Expenses</SelectItem>
                    <SelectItem value="community_event">Community Event</SelectItem>
                    <SelectItem value="charity">Charity Run/Walk</SelectItem>
                    <SelectItem value="equipment">Gym Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your story and why you need support..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal Amount ($) *</Label>
                  <Input
                    id="goal"
                    type="number"
                    min="1"
                    step="0.01"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="5000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State or Country"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Fundraiser"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-48 bg-muted rounded-lg mb-4" />
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-4" />
              <div className="h-2 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      ) : fundraisers && fundraisers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundraisers.map((fundraiser: any) => (
            <Card 
              key={fundraiser.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/fundraisers/${fundraiser.id}`)}
            >
              <div className="relative h-48 bg-gradient-hero flex items-center justify-center overflow-hidden">
                <Heart className="w-20 h-20 text-white/30" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                    {getCategoryLabel(fundraiser.category)}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {fundraiser.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fundraiser.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">${fundraiser.current_amount?.toLocaleString() || 0}</span>
                    <span className="text-muted-foreground">of ${fundraiser.goal_amount?.toLocaleString()}</span>
                  </div>
                  <Progress value={getProgressPercentage(fundraiser.current_amount || 0, fundraiser.goal_amount)} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{Math.round(getProgressPercentage(fundraiser.current_amount || 0, fundraiser.goal_amount))}% funded</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  {fundraiser.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{fundraiser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Ends {format(new Date(fundraiser.end_date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">by</span>
                    <span className="font-medium">{fundraiser.profiles?.full_name || fundraiser.profiles?.username || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Active Fundraisers</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to start a fundraiser and support your community!
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Start a Fundraiser
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Fundraisers;