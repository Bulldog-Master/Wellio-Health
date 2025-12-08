import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Copy, Check, Bookmark, Edit, MoreVertical, Flag, UserX, User, Send } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { MentionInput } from "@/components/MentionInput";
import { LazyImage } from "@/components/LazyImage";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  userLikes?: string[];
  userBookmarks?: string[];
  userReactions?: Record<string, string>;
  reactionsCounts?: Record<string, Record<string, number>>;
  comments?: any[];
  selectedPostId: string | null;
  copiedPostId: string | null;
  editingPostId: string | null;
  editContent: string;
  commentContent: string;
  animatingReaction: string | null;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onToggleReaction: (postId: string, reactionType: string) => void;
  onSelectPost: (postId: string | null) => void;
  onSharePost: (postId: string, platform?: string) => void;
  onEditPost: (post: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditContentChange: (content: string) => void;
  onReportPost: (postId: string) => void;
  onBlockUser: (userId: string) => void;
  onCommentContentChange: (content: string) => void;
  onAddComment: () => void;
  isAddingComment: boolean;
  renderContentWithHashtags: (content: string) => React.ReactNode;
}

const reactionEmojis: Record<string, string> = {
  like: "❤️",
  fire: "🔥",
  muscle: "💪",
  clap: "👏",
  target: "🎯",
  heart: "💙",
};

export const PostCard = ({
  post,
  currentUserId,
  userLikes,
  userBookmarks,
  userReactions,
  reactionsCounts,
  comments,
  selectedPostId,
  copiedPostId,
  editingPostId,
  editContent,
  commentContent,
  animatingReaction,
  onToggleLike,
  onToggleBookmark,
  onToggleReaction,
  onSelectPost,
  onSharePost,
  onEditPost,
  onCancelEdit,
  onSaveEdit,
  onEditContentChange,
  onReportPost,
  onBlockUser,
  onCommentContentChange,
  onAddComment,
  isAddingComment,
  renderContentWithHashtags,
}: PostCardProps) => {
  const { t } = useTranslation(['social', 'feed']);
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
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
      </CardHeader>
      <CardContent className="space-y-4">
        {editingPostId === post.id ? (
          <div className="space-y-2">
            <MentionInput
              value={editContent}
              onChange={onEditContentChange}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onCancelEdit}>
                {t('cancel')}
              </Button>
              <Button size="sm" onClick={onSaveEdit}>
                {t('save')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-base">{renderContentWithHashtags(post.content)}</p>
        )}

        {post.media_url && post.post_type === 'video' ? (
          <video
            src={post.media_url}
            controls
            className="rounded-lg w-full max-h-96"
          />
        ) : post.media_url && (
          <LazyImage
            src={post.media_url}
            alt="Post media"
            className="rounded-lg w-full object-cover max-h-96"
            skeletonClassName="w-full h-96 rounded-lg"
          />
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLike(post.id)}
              className={userLikes?.includes(post.id) ? "text-red-500" : ""}
            >
              <Heart
                className={`w-4 h-4 mr-1 ${userLikes?.includes(post.id) ? "fill-current" : ""}`}
              />
              {post.likes_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectPost(selectedPostId === post.id ? null : post.id)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.comments_count}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  {t('share')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSharePost(post.id, 'copy')}>
                  {copiedPostId === post.id ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {t('copy_link')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSharePost(post.id, 'twitter')}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  {t('share_on_x')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSharePost(post.id, 'facebook')}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {t('share_on_facebook')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSharePost(post.id, 'linkedin')}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  {t('share_on_linkedin')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBookmark(post.id)}
            className={userBookmarks?.includes(post.id) ? "text-primary" : ""}
          >
            <Bookmark
              className={`w-4 h-4 ${userBookmarks?.includes(post.id) ? "fill-current" : ""}`}
            />
          </Button>
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(reactionEmojis).map(([type, emoji]) => {
            const count = reactionsCounts?.[post.id]?.[type] || 0;
            const isSelected = userReactions?.[post.id] === type;
            const isAnimating = animatingReaction === `${post.id}-${type}`;
            
            return (
              <Button
                key={type}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleReaction(post.id, type)}
                className={`h-8 transition-all duration-300 ${
                  isAnimating ? "animate-[bounce_0.6s_ease-in-out]" : ""
                } ${isSelected ? "scale-110" : "hover:scale-105"}`}
              >
                <span className={`mr-1 inline-block ${isAnimating ? "animate-[spin_0.6s_ease-in-out]" : ""}`}>
                  {emoji}
                </span>
                {count > 0 && <span className="text-xs">{count}</span>}
              </Button>
            );
          })}
        </div>

        {/* Comments Section */}
        {selectedPostId === post.id && (
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
        )}
      </CardContent>
    </Card>
  );
};
