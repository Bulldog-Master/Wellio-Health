import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Instagram, Youtube, Twitter, ExternalLink, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SocialConnection {
  id: string;
  platform: string;
  username: string;
  profile_url: string | null;
  connection_type: string;
}

const Socials = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: "instagram",
    username: "",
    profile_url: "",
    connection_type: "personal",
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConnection = async () => {
    if (!formData.username) {
      toast({
        title: "Missing information",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('social_connections')
        .insert({
          user_id: user.id,
          platform: formData.platform,
          username: formData.username,
          profile_url: formData.profile_url || null,
          connection_type: formData.connection_type,
        });

      if (error) throw error;

      toast({
        title: "Connection added",
        description: `${formData.username} has been added to your connections.`,
      });

      setFormData({
        platform: "instagram",
        username: "",
        profile_url: "",
        connection_type: "personal",
      });
      setShowAddForm(false);
      fetchConnections();
    } catch (error) {
      console.error('Error adding connection:', error);
      toast({
        title: "Error",
        description: "Failed to add connection.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConnection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Connection removed",
        description: "The connection has been removed.",
      });

      fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection.",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-primary" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-primary" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-primary" />;
      default:
        return <Users className="w-5 h-5 text-primary" />;
    }
  };

  const personalConnections = connections.filter(c => c.connection_type === 'personal');
  const creatorConnections = connections.filter(c => c.connection_type === 'creator');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Social Connections</h1>
            <p className="text-muted-foreground">Connect with friends and fitness creators</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Connection
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-6">New Connection</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="strava">Strava</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-url">Profile URL (optional)</Label>
              <Input
                id="profile-url"
                placeholder="https://..."
                value={formData.profile_url}
                onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="connection-type">Connection Type</Label>
              <Select
                value={formData.connection_type}
                onValueChange={(value) => setFormData({ ...formData, connection_type: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Account</SelectItem>
                  <SelectItem value="creator">Creator / Following</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddConnection}>Add Connection</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Personal Accounts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Personal Accounts</h2>
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : personalConnections.length > 0 ? (
              personalConnections.map((connection) => (
                <div key={connection.id} className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getPlatformIcon(connection.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{connection.username}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{connection.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.profile_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(connection.profile_url!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteConnection(connection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No personal accounts yet. Add one above!
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Creators & Following Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Creators & Following</h2>
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="space-y-3">
            {creatorConnections.length > 0 ? (
              creatorConnections.map((connection) => (
                <div key={connection.id} className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getPlatformIcon(connection.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{connection.username}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{connection.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.profile_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(connection.profile_url!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteConnection(connection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Not following any creators yet. Add one above!
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Socials;