import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { MentionInput } from "@/components/MentionInput";

interface PostCommentsProps {
  comments?: any[];
  commentContent: string;
  isAddingComment: boolean;
  onCommentContentChange: (content: string) => void;
  onAddComment: () => void;
}

export function PostComments({
  comments,
  commentContent,
  isAddingComment,
  onCommentContentChange,
  onAddComment,
}: PostCommentsProps) {
  const { t } = useTranslation(['social', 'feed']);

  return (
    <div className="space-y-3 pt-3 border-t">
      {comments?.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Avatar className="w-8 h-8">
            {comment.profile?.avatar_url ? (
              <AvatarImage
                src={comment.profile.avatar_url}
                alt={comment.profile.full_name || "User"}
              />
            ) : (
              <AvatarFallback>
                <User className="w-3 h-3" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 bg-muted rounded-lg p-3">
            <p className="font-semibold text-sm">{comment.profile?.full_name || t('anonymous')}</p>
            <p className="text-sm">{comment.content}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <MentionInput
          placeholder={t('write_comment')}
          value={commentContent}
          onChange={onCommentContentChange}
          rows={2}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={onAddComment}
            disabled={!commentContent.trim() || isAddingComment}
          >
            <Send className="w-4 h-4 mr-2" />
            {t('comment')}
          </Button>
        </div>
      </div>
    </div>
  );
}
