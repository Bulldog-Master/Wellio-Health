import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Heart, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    post_type: string;
    profiles?: {
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  onClick: () => void;
}

export const PostCard = ({ post, onClick }: PostCardProps) => {
  const { t } = useTranslation('search');

  return (
    <Card 
      className="hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url || ""} />
            <AvatarFallback>
              {post.profiles?.full_name?.[0] || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">{post.profiles?.full_name || t('anonymous')}</p>
              {post.profiles?.username && (
                <p className="text-sm text-muted-foreground">@{post.profiles.username}</p>
              )}
              <p className="text-xs text-muted-foreground">
                • {format(new Date(post.created_at), "MMM dd")}
              </p>
            </div>
            <p className="text-sm line-clamp-3">{post.content}</p>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3" />
                {post.likes_count}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle className="h-3 w-3" />
                {post.comments_count}
              </span>
              <Badge variant="secondary" className="text-xs">
                {post.post_type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
