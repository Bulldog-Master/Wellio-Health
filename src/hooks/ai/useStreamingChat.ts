import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseStreamingChatOptions {
  onError?: (error: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitness-chat-stream`;

export const useStreamingChat = (options?: UseStreamingChatOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamMessage = useCallback(async ({
    message,
    conversationHistory,
    accessToken,
    onDelta,
    onDone,
  }: {
    message: string;
    conversationHistory: Message[];
    accessToken: string | null;
    onDelta: (deltaText: string) => void;
    onDone: () => void;
  }) => {
    setIsStreaming(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ message, conversationHistory }),
      });

      // Handle specific error codes
      if (resp.status === 429) {
        options?.onError?.('Rate limit exceeded. Please wait a moment and try again.');
        onDone();
        return;
      }

      if (resp.status === 402) {
        options?.onError?.('AI usage limit reached. Please try again later.');
        onDone();
        return;
      }

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line as data arrives
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1); // handle CRLF
          if (line.startsWith(':') || line.trim() === '') continue; // SSE comments/keepalive
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content); // emit token(s) immediately
          } catch {
            // Incomplete JSON split across chunks: put it back and wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush in case remaining buffered lines arrived without trailing newline
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            /* ignore partial leftovers */
          }
        }
      }

      onDone();
    } catch (error) {
      console.error('Streaming chat error:', error);
      options?.onError?.(error instanceof Error ? error.message : 'Failed to send message');
      onDone();
    } finally {
      setIsStreaming(false);
    }
  }, [options]);

  return { streamMessage, isStreaming };
};
