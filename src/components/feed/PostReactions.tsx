import { Button } from "@/components/ui/button";

const reactionEmojis: Record<string, string> = {
  like: "❤️",
  fire: "🔥",
  muscle: "💪",
  clap: "👏",
  target: "🎯",
  heart: "💙",
};

interface PostReactionsProps {
  postId: string;
  userReactions?: Record<string, string>;
  reactionsCounts?: Record<string, Record<string, number>>;
  animatingReaction: string | null;
  onToggleReaction: (postId: string, reactionType: string) => void;
}

export function PostReactions({
  postId,
  userReactions,
  reactionsCounts,
  animatingReaction,
  onToggleReaction,
}: PostReactionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(reactionEmojis).map(([type, emoji]) => {
        const count = reactionsCounts?.[postId]?.[type] || 0;
        const isSelected = userReactions?.[postId] === type;
        const isAnimating = animatingReaction === `${postId}-${type}`;
        
        return (
          <Button
            key={type}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleReaction(postId, type)}
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
  );
}
