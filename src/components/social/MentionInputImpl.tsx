import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AtSign } from "lucide-react";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

interface UserSuggestion {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const MentionInput = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
}: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mentionQuery) {
      searchUsers(mentionQuery);
    } else {
      setSuggestions([]);
    }
  }, [mentionQuery]);

  const searchUsers = async (query: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, allow_mentions")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .eq("allow_mentions", true)
        .limit(5);

      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);

    const textBeforeCursor = newValue.slice(0, newCursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      
      if (!textAfterAt.includes(" ") && textAfterAt.length > 0) {
        setMentionQuery(textAfterAt);
        setSelectedIndex(0);
      } else if (textAfterAt.length === 0) {
        setMentionQuery("");
        setShowSuggestions(true);
        searchUsers("");
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user: UserSuggestion) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const beforeMention = textBeforeCursor.slice(0, lastAtSymbol);
      const mention = `@${user.username} `;
      const newValue = beforeMention + mention + textAfterCursor;
      const newCursorPosition = (beforeMention + mention).length;

      onChange(newValue);
      setShowSuggestions(false);
      setMentionQuery("");

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute bottom-full left-0 mb-2 w-full max-h-60 overflow-y-auto z-50 animate-fade-in"
        >
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
              <AtSign className="w-3 h-3" />
              <span>Mention someone</span>
            </div>
            {suggestions.map((user, index) => (
              <button
                key={user.id}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  index === selectedIndex
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => insertMention(user)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.full_name?.[0] || user.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MentionInput;
