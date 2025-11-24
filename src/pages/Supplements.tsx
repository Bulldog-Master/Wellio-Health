import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill, ListChecks, TrendingUp, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Supplement {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  dosage: string | null;
  frequency: string | null;
  product_link: string | null;
  notes: string | null;
  is_active: boolean | null;
}

const popularSupplements = [
  { name: "Vitamin D3", description: "Supports bone health and immunity", category: "Vitamin" },
  { name: "Omega-3 Fish Oil", description: "Heart and brain health support", category: "Essential Fatty Acid" },
  { name: "Multivitamin", description: "Daily nutritional foundation", category: "Vitamin Complex" },
  { name: "Protein Powder", description: "Muscle recovery and growth", category: "Protein" },
  { name: "Magnesium", description: "Sleep and muscle function", category: "Mineral" },
  { name: "Vitamin B Complex", description: "Energy and metabolism support", category: "Vitamin" },
];

const Supplements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplement, setSelectedSupplement] = useState<{ name: string; description: string; category: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    dosage: "",
    frequency: "",
    product_link: "",
    notes: "",
  });

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupplements(data || []);
    } catch (error) {
      console.error('Error fetching supplements:', error);
      toast({
        title: "Error",
        description: "Failed to load supplements.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopularClick = (supplement: { name: string; description: string; category: string }) => {
    setSelectedSupplement(supplement);
    setFormData({
      name: supplement.name,
      description: supplement.description,
      category: supplement.category,
      dosage: "",
      frequency: "",
      product_link: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleCustomAdd = () => {
    setSelectedSupplement(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      dosage: "",
      frequency: "",
      product_link: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: "Name required",
        description: "Please enter a supplement name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add supplements.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('supplements')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          dosage: formData.dosage || null,
          frequency: formData.frequency || null,
          product_link: formData.product_link || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplement added to your list.",
      });

      setIsDialogOpen(false);
      fetchSupplements();
    } catch (error) {
      console.error('Error saving supplement:', error);
      toast({
        title: "Error",
        description: "Failed to save supplement.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('supplements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Supplement removed from your list.",
      });

      fetchSupplements();
    } catch (error) {
      console.error('Error deleting supplement:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplement.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Pill className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Supplements</h1>
            <p className="text-muted-foreground">Track and discover supplements</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/activity')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Activity
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Personal List
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Supplements</h3>
              <Button size="sm" className="gap-2" onClick={handleCustomAdd}>
                <Plus className="w-4 h-4" />
                Add Supplement
              </Button>
            </div>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : supplements.length > 0 ? (
              <div className="space-y-3">
                {supplements.map((supplement) => (
                  <div key={supplement.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Pill className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{supplement.name}</h4>
                            {supplement.category && (
                              <span className="text-xs text-primary font-medium">
                                {supplement.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {supplement.description && (
                          <p className="text-sm text-muted-foreground mb-2">{supplement.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {supplement.dosage && (
                            <div>
                              <span className="font-medium">Dosage:</span> {supplement.dosage}
                            </div>
                          )}
                          {supplement.frequency && (
                            <div>
                              <span className="font-medium">Frequency:</span> {supplement.frequency}
                            </div>
                          )}
                        </div>
                        {supplement.product_link && (
                          <a 
                            href={supplement.product_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                          >
                            View Product
                          </a>
                        )}
                        {supplement.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">{supplement.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(supplement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No supplements added yet.</p>
                <p className="text-sm mt-2">Start adding supplements to track your intake.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Popular Supplements</h3>
              <Button size="sm" className="gap-2" onClick={handleCustomAdd}>
                <Plus className="w-4 h-4" />
                Add Custom
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularSupplements.map((supplement, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-all cursor-pointer"
                  onClick={() => handlePopularClick(supplement)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{supplement.name}</h4>
                      <p className="text-sm text-muted-foreground">{supplement.description}</p>
                      <span className="text-xs text-primary font-medium mt-1 inline-block">
                        {supplement.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Supplement</DialogTitle>
            <DialogDescription>
              {selectedSupplement ? "Add this supplement to your personal list" : "Add a custom supplement"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Supplement name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Vitamin, Mineral"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 1000mg"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Once daily"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="product_link">Product Link</Label>
              <Input
                id="product_link"
                type="url"
                value={formData.product_link}
                onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                placeholder="https://example.com/product"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Benefits and usage notes"
                className="mt-1.5"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Personal notes"
                className="mt-1.5"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? "Saving..." : "Save Supplement"}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Supplements;
