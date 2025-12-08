import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, UserCheck, Trophy, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  current_streak: number;
  followers_count: number;
  following_count?: number;
}

interface UserCardProps {
  user: UserProfile;
  isFollowing: boolean;
  onUserClick: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
  showRank?: boolean;
  rank?: number;
}

export const UserCard = ({ 
  user, 
  isFollowing, 
  onUserClick, 
  onToggleFollow,
  showRank = false,
  rank = 0
}: UserCardProps) => {
  const { t } = useTranslation('search');

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-4 flex-1 cursor-pointer"
            onClick={() => onUserClick(user.id)}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback>
                  {user.full_name?.[0] || user.username?.[0] || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              {showRank && rank < 3 && (
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {rank + 1}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{user.full_name || t('anonymous')}</p>
              {user.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  {user.total_points} {t('pts')}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {user.current_streak} {t('day_streak')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {user.followers_count} {t('followers')}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant={isFollowing ? "secondary" : "default"}
            size="sm"
            onClick={() => onToggleFollow(user.id)}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                {t('following')}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('follow')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
