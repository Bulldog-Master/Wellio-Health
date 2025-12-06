import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type ContentType = 'progress_photo' | 'voice_note' | 'workout_media' | 'food_image';

export interface ContentShare {
  id: string;
  owner_id: string;
  content_type: ContentType;
  content_path: string;
  shared_with_user_id: string | null;
  share_token: string | null;
  is_public: boolean;
  expires_at: string | null;
  created_at: string;
}

interface ShareContentOptions {
  contentPath: string;
  contentType: ContentType;
  sharedWithUserId?: string;
  isPublic?: boolean;
  expiresInDays?: number;
}

export const useContentSharing = () => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<ContentShare[]>([]);

  // Generate a secure share token
  const generateShareToken = () => {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  // Create a new share
  const createShare = useCallback(async (options: ShareContentOptions): Promise<ContentShare | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('pleaseLoginToShare'));
        return null;
      }

      const shareToken = options.isPublic || !options.sharedWithUserId ? generateShareToken() : null;
      const expiresAt = options.expiresInDays 
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('content_shares')
        .insert({
          owner_id: user.id,
          content_type: options.contentType,
          content_path: options.contentPath,
          shared_with_user_id: options.sharedWithUserId || null,
          share_token: shareToken,
          is_public: options.isPublic || false,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(t('contentShared'));
      return data as ContentShare;
    } catch (error: any) {
      console.error('Error creating share:', error);
      if (error.code === '23505') {
        toast.error(t('alreadySharedWithUser'));
      } else {
        toast.error(t('failedToShare'));
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Get all shares for a specific content
  const getSharesForContent = useCallback(async (contentPath: string, contentType: ContentType) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('content_shares')
        .select('*')
        .eq('owner_id', user.id)
        .eq('content_path', contentPath)
        .eq('content_type', contentType);

      if (error) throw error;
      setShares(data as ContentShare[]);
      return data as ContentShare[];
    } catch (error) {
      console.error('Error fetching shares:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove a share
  const removeShare = useCallback(async (shareId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      setShares(prev => prev.filter(s => s.id !== shareId));
      toast.success(t('shareRemoved'));
      return true;
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error(t('failedToRemoveShare'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Toggle public sharing
  const togglePublicShare = useCallback(async (
    contentPath: string, 
    contentType: ContentType,
    makePublic: boolean,
    expiresInDays?: number
  ) => {
    if (makePublic) {
      return createShare({
        contentPath,
        contentType,
        isPublic: true,
        expiresInDays,
      });
    } else {
      // Find and remove the public share
      const existingShares = await getSharesForContent(contentPath, contentType);
      const publicShare = existingShares.find(s => s.is_public);
      if (publicShare) {
        await removeShare(publicShare.id);
      }
      return null;
    }
  }, [createShare, getSharesForContent, removeShare]);

  // Get shareable link
  const getShareableLink = useCallback((shareToken: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${shareToken}`;
  }, []);

  // Copy share link to clipboard
  const copyShareLink = useCallback(async (shareToken: string) => {
    try {
      const link = getShareableLink(shareToken);
      await navigator.clipboard.writeText(link);
      toast.success(t('linkCopied'));
      return true;
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error(t('failedToCopyLink'));
      return false;
    }
  }, [getShareableLink, t]);

  return {
    loading,
    shares,
    createShare,
    getSharesForContent,
    removeShare,
    togglePublicShare,
    getShareableLink,
    copyShareLink,
  };
};
