import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// Simple markdown-like formatting
const formatContent = (content: string) => {
  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Code block
      const code = part.slice(3, -3).replace(/^\w+\n/, ''); // Remove language identifier
      return (
        <pre key={index} className="bg-background/50 rounded-md p-3 my-2 overflow-x-auto text-sm font-mono">
          {code}
        </pre>
      );
    }
    
    // Process inline formatting
    const lines = part.split('\n');
    return lines.map((line, lineIndex) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={`${index}-${lineIndex}`} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={`${index}-${lineIndex}`} className="font-semibold text-lg mt-3 mb-1">{line.slice(3)}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={`${index}-${lineIndex}`} className="font-bold text-xl mt-3 mb-2">{line.slice(2)}</h2>;
      }
      
      // Bullet points
      if (line.match(/^[-*]\s/)) {
        return (
          <div key={`${index}-${lineIndex}`} className="flex gap-2 ml-2 my-0.5">
            <span className="text-primary">•</span>
            <span>{formatInline(line.slice(2))}</span>
          </div>
        );
      }
      
      // Numbered lists
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          return (
            <div key={`${index}-${lineIndex}`} className="flex gap-2 ml-2 my-0.5">
              <span className="text-primary font-medium">{match[1]}.</span>
              <span>{formatInline(match[2])}</span>
            </div>
          );
        }
      }
      
      // Empty lines become spacing
      if (line.trim() === '') {
        return <div key={`${index}-${lineIndex}`} className="h-2" />;
      }
      
      // Regular paragraph
      return <p key={`${index}-${lineIndex}`} className="my-0.5">{formatInline(line)}</p>;
    });
  });
};

// Format inline elements like bold, italic, code
const formatInline = (text: string) => {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let keyIndex = 0;
  
  // Process bold **text**
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={keyIndex++} className="font-semibold">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  if (parts.length === 0) return text;
  return <>{parts}</>;
};

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const { t } = useTranslation(['chat']);

  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
      <Avatar className={`shrink-0 ${role === 'assistant' ? 'bg-primary/10' : 'bg-secondary'}`}>
        <AvatarFallback>
          {role === 'assistant' ? (
            <Bot className="w-4 h-4 text-primary" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm font-medium mb-1">
          {role === 'assistant' ? t('ai_assistant') : t('you')}
        </p>
        <div className="text-sm leading-relaxed">
          {role === 'assistant' ? formatContent(content) : content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};
