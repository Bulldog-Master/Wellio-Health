import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContentSharing, type ContentType, type ContentShare } from '@/hooks/social';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';
import { useTranslation } from 'react-i18next';
import { Copy, Link, Trash2, Users, Globe, Clock, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentPath: string;
  contentType: ContentType;
  contentPreview?: string; // URL for image preview
  contentTitle?: string;
}

interface SharedUser {
  id: string;
  username: string;
  avatar_url: string | null;
  share_id: string;
}

export const ShareDialog = ({
  open,
  onOpenChange,
  contentPath,
  contentType,
  contentPreview,
  contentTitle,
}: ShareDialogProps) => {
  const { t } = useTranslation('common');
  const {
    loading,
    shares,
    createShare,
    getSharesForContent,
    removeShare,
    copyShareLink,
  } = useContentSharing();

  const [isPublic, setIsPublic] = useState(false);
  const [publicShareToken, setPublicShareToken] = useState<string | null>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [expiration, setExpiration] = useState<string>('never');
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  // Load existing shares when dialog opens
  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, contentPath, contentType]);

  const loadShares = async () => {
    const existingShares = await getSharesForContent(contentPath, contentType);
    
    // Find public share
    const publicShare = existingShares.find(s => s.is_public);
    setIsPublic(!!publicShare);
    setPublicShareToken(publicShare?.share_token || null);

    // Load user details for user-specific shares
    const userShares = existingShares.filter(s => s.shared_with_user_id);
    if (userShares.length > 0) {
      const userIds = userShares.map(s => s.shared_with_user_id!);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profiles) {
        setSharedUsers(
          profiles.map(p => ({
            id: p.id,
            username: p.username || 'User',
            avatar_url: p.avatar_url,
            share_id: userShares.find(s => s.shared_with_user_id === p.id)?.id || '',
          }))
        );
      }
    } else {
      setSharedUsers([]);
    }
  };

  const handleTogglePublic = async () => {
    if (!isPublic) {
      // Create public share
      const expiresInDays = expiration === 'never' ? undefined : parseInt(expiration);
      const share = await createShare({
        contentPath,
        contentType,
        isPublic: true,
        expiresInDays,
      });
      if (share) {
        setIsPublic(true);
        setPublicShareToken(share.share_token);
      }
    } else {
      // Remove public share
      const publicShare = shares.find(s => s.is_public);
      if (publicShare) {
        await removeShare(publicShare.id);
        setIsPublic(false);
        setPublicShareToken(null);
      }
    }
  };

  const handleShareWithUser = async () => {
    if (!selectedUsername) return;

    // Find user ID from username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('username', selectedUsername)
      .single();

    if (!profile) {
      return;
    }

    const share = await createShare({
      contentPath,
      contentType,
      sharedWithUserId: profile.id,
    });

    if (share) {
      setSharedUsers(prev => [
        ...prev,
        {
          id: profile.id,
          username: profile.username || 'User',
          avatar_url: profile.avatar_url,
          share_id: share.id,
        },
      ]);
      setSelectedUsername('');
    }
  };

  const handleRemoveUserShare = async (shareId: string, userId: string) => {
    const success = await removeShare(shareId);
    if (success) {
      setSharedUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'progress_photo':
        return t('progressPhoto');
      case 'voice_note':
        return t('voiceNote');
      case 'workout_media':
        return t('workoutMedia');
      case 'food_image':
        return t('foodImage');
      default:
        return t('content');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('shareContent')}
          </DialogTitle>
          <DialogDescription>
            {t('shareContentDescription', { type: getContentTypeLabel() })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Preview */}
          {contentPreview && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <img
                src={contentPreview}
                alt={contentTitle || getContentTypeLabel()}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {contentTitle || getContentTypeLabel()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPublic ? t('publiclyShared') : t('privateContent')}
                </p>
              </div>
            </div>
          )}

          {/* Public Link Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="public-toggle">{t('publicLink')}</Label>
              </div>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={handleTogglePublic}
                disabled={loading}
              />
            </div>

            {isPublic && publicShareToken && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/shared/${publicShareToken}`}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyShareLink(publicShareToken)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{t('expiresNever')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Share with Specific Users */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-muted-foreground" />
              <Label>{t('shareWithPeople')}</Label>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <UserSearchCombobox
                  value={selectedUsername}
                  onChange={setSelectedUsername}
                  placeholder={t('searchUsers')}
                />
              </div>
              <Button
                onClick={handleShareWithUser}
                disabled={!selectedUsername || loading}
              >
                {t('share')}
              </Button>
            </div>

            {/* Shared Users List */}
            {sharedUsers.length > 0 && (
              <ScrollArea className="max-h-40">
                <div className="space-y-2">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUserShare(user.share_id, user.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
