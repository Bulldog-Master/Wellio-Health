import * as React from "react";

interface VideoRoom {
  id: string;
  meetingUrl: string;
  token?: string;
}

interface LiveVideoContextValue {
  createRoom: (options?: { clientId?: string; label?: string }) => Promise<VideoRoom>;
  joinRoom: (roomId: string) => Promise<VideoRoom>;
  endRoom: (roomId: string) => Promise<void>;
  isCreating: boolean;
}

const LiveVideoContext = React.createContext<LiveVideoContextValue | null>(null);

export function useLiveVideo() {
  const ctx = React.useContext(LiveVideoContext);
  if (!ctx) {
    throw new Error("useLiveVideo must be used within LiveVideoProvider");
  }
  return ctx;
}

interface LiveVideoProviderProps {
  children: React.ReactNode;
  /** 
   * Provider type: 'daily' | 'livekit' | 'jitsi' | 'internal'
   * Defaults to 'internal' which uses live_workout_sessions table
   */
  provider?: "daily" | "livekit" | "jitsi" | "internal";
}

export function LiveVideoProvider({ 
  children, 
  provider = "internal" 
}: LiveVideoProviderProps) {
  const [isCreating, setIsCreating] = React.useState(false);

  const createRoom = React.useCallback(async (options?: { clientId?: string; label?: string }): Promise<VideoRoom> => {
    setIsCreating(true);
    try {
      // For internal provider, we use live_workout_sessions
      // For external providers (Daily/LiveKit/Jitsi), call their APIs
      
      if (provider === "internal") {
        // Internal: create a live_workout_session record
        // The actual video would be handled by WebRTC or similar
        const roomId = crypto.randomUUID();
        return {
          id: roomId,
          meetingUrl: `/live-session/${roomId}`,
        };
      }
      
      // External providers - call edge function
      const res = await fetch("/api/video/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          provider, 
          clientId: options?.clientId,
          label: options?.label 
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create video room");
      }
      
      const json = await res.json();
      return {
        id: json.roomId,
        meetingUrl: json.meetingUrl,
        token: json.token,
      };
    } finally {
      setIsCreating(false);
    }
  }, [provider]);

  const joinRoom = React.useCallback(async (roomId: string): Promise<VideoRoom> => {
    if (provider === "internal") {
      return {
        id: roomId,
        meetingUrl: `/live-session/${roomId}`,
      };
    }
    
    // External providers - get join token
    const res = await fetch(`/api/video/join-room?roomId=${roomId}&provider=${provider}`);
    if (!res.ok) {
      throw new Error("Failed to join video room");
    }
    const json = await res.json();
    return {
      id: roomId,
      meetingUrl: json.meetingUrl,
      token: json.token,
    };
  }, [provider]);

  const endRoom = React.useCallback(async (roomId: string): Promise<void> => {
    if (provider === "internal") {
      // Update live_workout_sessions status
      return;
    }
    
    // External providers - end room
    await fetch("/api/video/end-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, provider }),
    });
  }, [provider]);

  const value = React.useMemo(() => ({
    createRoom,
    joinRoom,
    endRoom,
    isCreating,
  }), [createRoom, joinRoom, endRoom, isCreating]);

  return (
    <LiveVideoContext.Provider value={value}>
      {children}
    </LiveVideoContext.Provider>
  );
}
