import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Hash } from "lucide-react";
import { useSearch } from "@/hooks/social/useSearch";
import { SearchBar, UserCard, PostCard, HashtagCard } from "@/components/search";

const Search = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('search');
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    searchResults,
    isLoading,
    topUsers,
    searchPosts,
    searchHashtags,
    isFollowing,
    toggleFollow,
  } = useSearch();

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('search_discover')}</h1>
        <p className="text-muted-foreground">{t('find_users_posts')}</p>
      </div>

      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* Search Results with Tabs */}
      {searchQuery.trim() && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="gap-2">
              <User className="h-4 w-4" />
              {t('users')}
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('posts')}
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="gap-2">
              <Hash className="h-4 w-4" />
              {t('hashtags')}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">{t('users')}</h2>
            {isLoading ? (
              <p className="text-muted-foreground">{t('searching')}</p>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={isFollowing(user.id)}
                    onUserClick={(id) => navigate(`/user/${id}`)}
                    onToggleFollow={toggleFollow}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {t('no_users_found', { query: searchQuery })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">{t('posts')}</h2>
            {searchPosts && searchPosts.length > 0 ? (
              <div className="space-y-3">
                {searchPosts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => navigate('/feed')}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {t('no_posts_found', { query: searchQuery })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Hashtags Tab */}
          <TabsContent value="hashtags" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">{t('hashtags')}</h2>
            {searchHashtags && searchHashtags.length > 0 ? (
              <div className="grid gap-3">
                {searchHashtags.map((item: any) => (
                  <HashtagCard
                    key={item.hashtag}
                    hashtag={item.hashtag}
                    count={item.count}
                    onClick={() => {
                      setSearchQuery(item.hashtag);
                      setActiveTab("posts");
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {t('no_hashtags_found', { query: searchQuery })}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Top Users */}
      {!searchQuery.trim() && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('top_users')}</h2>
          {topUsers && topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isFollowing={isFollowing(user.id)}
                  onUserClick={(id) => navigate(`/user/${id}`)}
                  onToggleFollow={toggleFollow}
                  showRank
                  rank={index}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t('no_users_available')}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
