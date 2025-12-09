import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { MentionInput } from "@/components/social";
import { LazyImage } from "@/components/common";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { PostReactions } from "./PostReactions";
import { PostComments } from "./PostComments";

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

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <PostHeader
          post={post}
          currentUserId={currentUserId}
          onEditPost={onEditPost}
          onReportPost={onReportPost}
          onBlockUser={onBlockUser}
        />
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

        <PostActions
          post={post}
          userLikes={userLikes}
          userBookmarks={userBookmarks}
          selectedPostId={selectedPostId}
          copiedPostId={copiedPostId}
          onToggleLike={onToggleLike}
          onToggleBookmark={onToggleBookmark}
          onSelectPost={onSelectPost}
          onSharePost={onSharePost}
        />

        <PostReactions
          postId={post.id}
          userReactions={userReactions}
          reactionsCounts={reactionsCounts}
          animatingReaction={animatingReaction}
          onToggleReaction={onToggleReaction}
        />

        {selectedPostId === post.id && (
          <PostComments
            comments={comments}
            commentContent={commentContent}
            isAddingComment={isAddingComment}
            onCommentContentChange={onCommentContentChange}
            onAddComment={onAddComment}
          />
        )}
      </CardContent>
    </Card>
  );
};
