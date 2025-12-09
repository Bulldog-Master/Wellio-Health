import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Instagram, Youtube, Twitter, ExternalLink, ArrowLeft, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/common";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('social');
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

  // Auto-show form if no connections exist
  useEffect(() => {
    if (!isLoading && connections.length === 0) {
      setShowAddForm(true);
    }
  }, [isLoading, connections.length]);

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
        title: t('missing_information'),
        description: t('please_enter_username'),
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
        title: t('connection_added'),
        description: t('connection_added_description', { username: formData.username }),
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
        title: t('error'),
        description: t('failed_add_connection'),
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
        title: t('connection_removed'),
        description: t('connection_removed_description'),
      });

      fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: t('error'),
        description: t('failed_remove_connection'),
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/connect")}
            aria-label={t('back_to_connect')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('social_connections')}</h1>
            <p className="text-muted-foreground">{t('connect_with_friends_creators')}</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('add_connection')}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-6">{t('new_connection')}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">{t('platform')}</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">{t('platform_instagram')}</SelectItem>
                    <SelectItem value="youtube">{t('platform_youtube')}</SelectItem>
                    <SelectItem value="twitter">{t('platform_twitter')}</SelectItem>
                    <SelectItem value="strava">{t('platform_strava')}</SelectItem>
                    <SelectItem value="other">{t('platform_other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  placeholder={t('username_placeholder')}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-url">{t('profile_url_optional')}</Label>
              <Input
                id="profile-url"
                placeholder={t('profile_url_placeholder')}
                value={formData.profile_url}
                onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="connection-type">{t('connection_type')}</Label>
              <Select
                value={formData.connection_type}
                onValueChange={(value) => setFormData({ ...formData, connection_type: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{t('personal_account')}</SelectItem>
                  <SelectItem value="creator">{t('creator_following')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddConnection}>{t('add_connection')}</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>{t('cancel')}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* In-App Following */}
      <Card className="p-6 bg-gradient-secondary text-foreground">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{t('follow_wellio_users')}</h3>
            <p className="text-muted-foreground text-sm">{t('connect_fitness_enthusiasts')}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/search')} 
          className="w-full"
        >
          {t('find_people_to_follow')}
        </Button>
      </Card>

      {/* Fitness Groups Quick Access */}
      <Card className="p-6 bg-gradient-primary text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{t('join_fitness_groups')}</h3>
            <p className="text-white/90 text-sm">{t('connect_communities_goals')}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/groups')} 
          className="w-full bg-white text-primary hover:bg-white/90"
        >
          {t('browse_groups')}
        </Button>
      </Card>

      {/* Personal Accounts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('personal_accounts')}</h2>
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
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
              <EmptyState
                icon={Instagram}
                title={t('no_personal_accounts')}
                description={t('add_social_accounts_description')}
                action={{
                  label: t('add_first_account'),
                  onClick: () => setShowAddForm(true)
                }}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Creators & Following Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('creators_following')}</h2>
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
              <EmptyState
                icon={Youtube}
                title={t('no_creators_following')}
                description={t('follow_creators_description')}
                action={{
                  label: t('add_first_creator'),
                  onClick: () => setShowAddForm(true)
                }}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Socials;