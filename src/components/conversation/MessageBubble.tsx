import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Lock } from 'lucide-react';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  content: string;
  isEncrypted: boolean;
}

export const MessageBubble = ({ message, isOwn, content, isEncrypted }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className="break-words">{content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          {isEncrypted && (
            <Lock className={`w-3 h-3 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
          )}
          <p className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
            ) : (
              <Check className="w-3 h-3 text-primary-foreground/70" />
            )
          )}
        </div>
      </div>
    </div>
  );
};
