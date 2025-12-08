import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HashtagCardProps {
  hashtag: string;
  count: number;
  onClick: () => void;
}

export const HashtagCard = ({ hashtag, count, onClick }: HashtagCardProps) => {
  const { t } = useTranslation('search');

  return (
    <Card 
      className="hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">#{hashtag}</p>
              <p className="text-sm text-muted-foreground">
                {count} {count === 1 ? t('post') : t('posts')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {t('view_posts')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
