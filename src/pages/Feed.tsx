import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFeedState, useFeedData, useFeedMutations, useRealtimePosts } from "@/hooks/social";
import { useSubscription } from "@/hooks/subscription";
import { 
  FeedHeader, 
  CreatePostCard, 
  PostCard, 
  ReferralBanner, 
  TrendingHashtagsSidebar, 
  GroupsQuickAccess, 
  ReportDialog 
} from "@/components/feed";
import { SuggestedUsers, MessagesSidebar } from "@/components/social";
import { AdBanner } from "@/components/common";

const Feed = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['social', 'feed']);
  const { hasFullAccess, hasFeature } = useSubscription();
  const canPostVideos = hasFullAccess || hasFeature('video_posts');

  // Use extracted state hook
  const feedState = useFeedState();
  const {
    selectedHashtag,
    postContent,
    setPostContent,
    selectedPostId,
    setSelectedPostId,
    commentContent,
    setCommentContent,
    uploadedImage,
    uploadedVideo,
    imagePreview,
    videoPreview,
    copiedPostId,
    editingPostId,
    editContent,
    setEditContent,
    reportDialogOpen,
    setReportDialogOpen,
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    animatingReaction,
    setAnimatingReaction,
    showReferralBanner,
    handleHashtagClick,
    clearHashtagFilter,
    handleSharePost,
    handleImageSelect,
    handleRemoveImage,
    handleVideoSelect,
    handleRemoveVideo,
    handleEditPost,
    handleCancelEdit,
    handleReportPost,
    resetPostForm,
    resetEditForm,
    resetReportForm,
    dismissReferralBanner,
  } = feedState;

  // Enable real-time updates for posts
  useRealtimePosts(["feed-posts", selectedHashtag]);

  // Use extracted data hook
  const {
    posts,
    trendingHashtags,
    userLikes,
    userBookmarks,
    currentUser,
    userReactions,
    reactionsCounts,
    comments,
  } = useFeedData(selectedHashtag, selectedPostId);

  // Use extracted mutations hook
  const mutations = useFeedMutations({ 
    userLikes, 
    onPostCreated: resetPostForm 
  });

  const {
    createPost,
    toggleLike,
    toggleBookmark,
    addReaction,
    addComment,
    blockUser,
    updatePost,
    reportPost,
  } = mutations;

  // Render hashtags as clickable links
  const renderContentWithHashtags = useCallback((content: string) => {
    const hashtagRegex = /#(\w+)/g;
    const parts = content.split(hashtagRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <button
            key={index}
            onClick={() => handleHashtagClick(part)}
            className="text-primary hover:underline font-medium"
          >
            #{part}
          </button>
        );
      }
      return part;
    });
  }, [handleHashtagClick]);

  const handleCreatePost = () => {
    createPost.mutate({ 
      postContent, 
      uploadedImage, 
      uploadedVideo 
    });
  };

  const handleToggleBookmark = (postId: string) => {
    const isBookmarked = userBookmarks?.includes(postId) || false;
    toggleBookmark.mutate({ postId, isBookmarked });
  };

  const handleToggleReaction = (postId: string, reactionType: string) => {
    setAnimatingReaction(`${postId}-${reactionType}`);
    addReaction.mutate({ postId, reactionType });
    setTimeout(() => setAnimatingReaction(null), 600);
  };

  const handleSaveEdit = () => {
    if (editingPostId && editContent.trim()) {
      updatePost.mutate({ postId: editingPostId, content: editContent });
      resetEditForm();
    }
  };

  const handleSubmitReport = () => {
    if (feedState.reportPostId && reportReason) {
      reportPost.mutate({ 
        postId: feedState.reportPostId, 
        reason: reportReason, 
        details: reportDetails 
      });
      resetReportForm();
    }
  };

  const handleAddComment = () => {
    if (selectedPostId && commentContent.trim()) {
      addComment.mutate({ postId: selectedPostId, content: commentContent });
      setCommentContent("");
    }
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto px-4 space-y-6">
      <FeedHeader 
        selectedHashtag={selectedHashtag} 
        onClearHashtagFilter={clearHashtagFilter} 
      />

      <ReferralBanner 
        show={showReferralBanner} 
        onHide={dismissReferralBanner} 
      />

      <AdBanner placement="feed" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <CreatePostCard
            postContent={postContent}
            setPostContent={setPostContent}
            imagePreview={imagePreview}
            videoPreview={videoPreview}
            canPostVideos={canPostVideos}
            isPending={createPost.isPending}
            onImageSelect={handleImageSelect}
            onVideoSelect={handleVideoSelect}
            onRemoveImage={handleRemoveImage}
            onRemoveVideo={handleRemoveVideo}
            onSubmit={handleCreatePost}
            uploadedImage={uploadedImage}
            uploadedVideo={uploadedVideo}
          />

          {/* Posts */}
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              userLikes={userLikes}
              userBookmarks={userBookmarks}
              userReactions={userReactions}
              reactionsCounts={reactionsCounts}
              comments={comments}
              selectedPostId={selectedPostId}
              copiedPostId={copiedPostId}
              editingPostId={editingPostId}
              editContent={editContent}
              commentContent={commentContent}
              animatingReaction={animatingReaction}
              onToggleLike={(postId) => toggleLike.mutate(postId)}
              onToggleBookmark={handleToggleBookmark}
              onToggleReaction={handleToggleReaction}
              onSelectPost={setSelectedPostId}
              onSharePost={handleSharePost}
              onEditPost={handleEditPost}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onEditContentChange={setEditContent}
              onReportPost={handleReportPost}
              onBlockUser={(userId) => blockUser.mutate(userId)}
              onCommentContentChange={setCommentContent}
              onAddComment={handleAddComment}
              isAddingComment={addComment.isPending}
              renderContentWithHashtags={renderContentWithHashtags}
            />
          ))}

          {posts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedHashtag 
                  ? t('no_posts_with_hashtag', { hashtag: selectedHashtag })
                  : t('no_posts_yet')}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          <MessagesSidebar />
          <SuggestedUsers />
          <GroupsQuickAccess />
          <TrendingHashtagsSidebar 
            hashtags={trendingHashtags} 
            onHashtagClick={handleHashtagClick} 
          />
        </div>
      </div>

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reason={reportReason}
        onReasonChange={setReportReason}
        details={reportDetails}
        onDetailsChange={setReportDetails}
        onSubmit={handleSubmitReport}
        isPending={reportPost.isPending}
      />
    </div>
  );
};

export default Feed;
