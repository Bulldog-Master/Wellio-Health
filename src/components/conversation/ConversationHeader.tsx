import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Lock, Shield, AlertCircle } from 'lucide-react';
import { ConversationDetails } from './types';

interface ConversationHeaderProps {
  conversation: ConversationDetails | undefined;
  isOnline: (userId: string) => boolean;
  canUseE2E: boolean;
  hasKeyPair: boolean;
  peerHasE2E: boolean | undefined;
  isGenerating: boolean;
  onEnableE2E: () => void;
}

export const ConversationHeader = ({
  conversation,
  isOnline,
  canUseE2E,
  hasKeyPair,
  peerHasE2E,
  isGenerating,
  onEnableE2E,
}: ConversationHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['messages', 'common']);

  return (
    <div className="flex items-center gap-4 mb-4">
      <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      {conversation?.other_user && (
        <>
          <Avatar
            className="h-10 w-10 cursor-pointer"
            onClick={() => navigate(`/user/${conversation.other_user!.id}`)}
          >
            <AvatarImage src={conversation.other_user.avatar_url || ''} />
            <AvatarFallback>
              {conversation.other_user.full_name?.[0] ||
                conversation.other_user.username?.[0] || (
                  <User className="h-5 w-5" />
                )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p
                className="font-semibold cursor-pointer hover:underline"
                onClick={() => navigate(`/user/${conversation.other_user!.id}`)}
              >
                {conversation.other_user.full_name || conversation.other_user.username || t('messages:anonymous')}
              </p>
              <div className={`w-2 h-2 rounded-full ${isOnline(conversation.other_user.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              {isOnline(conversation.other_user.id) ? t('messages:online') : t('messages:offline')}
            </p>
          </div>

          {/* E2E Status Indicator */}
          <div className="flex items-center gap-2">
            {canUseE2E ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                <Lock className="w-3 h-3 mr-1" />
                {t('messages:e2e_active')}
              </Badge>
            ) : hasKeyPair && !peerHasE2E ? (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t('messages:peer_no_e2e')}
              </Badge>
            ) : !hasKeyPair ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onEnableE2E}
                disabled={isGenerating}
                className="text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                {isGenerating ? t('common:loading') : t('messages:enable_e2e')}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
