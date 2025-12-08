import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Flag, UserX, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface PostHeaderProps {
  post: any;
  currentUserId?: string;
  onEditPost: (post: any) => void;
  onReportPost: (postId: string) => void;
  onBlockUser: (userId: string) => void;
}

export function PostHeader({ 
  post, 
  currentUserId, 
  onEditPost, 
  onReportPost, 
  onBlockUser 
}: PostHeaderProps) {
  const { t } = useTranslation(['social', 'feed']);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar 
          className="cursor-pointer"
          onClick={() => navigate(`/user/${post.user_id}`)}
        >
          {post.profile?.avatar_url ? (
            <AvatarImage src={post.profile.avatar_url} alt={post.profile.full_name || "User"} />
          ) : (
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <p 
            className="font-semibold cursor-pointer hover:underline"
            onClick={() => navigate(`/user/${post.user_id}`)}
          >
            {post.profile?.full_name || t('anonymous')}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            {post.edited_at && ` (${t('edited')})`}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {post.post_type}
        </Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentUserId === post.user_id ? (
            <DropdownMenuItem onClick={() => onEditPost(post)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('edit_post')}
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => onReportPost(post.id)}>
                <Flag className="w-4 h-4 mr-2" />
                {t('report_post')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onBlockUser(post.user_id)}
                className="text-destructive"
              >
                <UserX className="w-4 h-4 mr-2" />
                {t('block_user')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
