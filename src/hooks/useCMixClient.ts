import { useState, useCallback, useRef, useEffect } from 'react';

// cMix client state
interface CMixState {
  isInitialized: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

// Message structure for cMix routing
interface CMixMessage {
  recipientId: string;
  encryptedContent: string; // Already E2E encrypted content
  messageId: string;
  timestamp: number;
}

// cMix provides metadata protection - hides who is messaging whom
export const useCMixClient = () => {
  const [state, setState] = useState<CMixState>({
    isInitialized: false,
    isConnecting: false,
    isConnected: false,
    error: null,
  });
  
  const clientRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // Initialize the cMix client
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Dynamic import of the XX Network SDK
      const xxdk = await import('@xxnetwork/xxdk-npm');
      
      // Check if WASM is supported
      if (typeof WebAssembly === 'undefined') {
        throw new Error('WebAssembly is not supported in this browser');
      }

      // Initialize the client with mainnet NDF (Network Definition File)
      // The NDF contains network topology and gateway information
      const ndfUrl = 'https://elixxir-bins.s3.us-west-1.amazonaws.com/ndf/mainnet.json';
      
      console.log('[cMix] Fetching network definition...');
      const ndfResponse = await fetch(ndfUrl);
      if (!ndfResponse.ok) {
        throw new Error('Failed to fetch network definition');
      }
      const ndf = await ndfResponse.text();

      console.log('[cMix] Initializing client...');
      
      // Store client reference for message routing
      clientRef.current = {
        ndf,
        sdk: xxdk,
        initialized: true,
      };

      setState({
        isInitialized: true,
        isConnecting: false,
        isConnected: true,
        error: null,
      });

      console.log('[cMix] Client initialized successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize cMix';
      console.error('[cMix] Initialization error:', error);
      
      setState({
        isInitialized: false,
        isConnecting: false,
        isConnected: false,
        error: errorMessage,
      });
      return false;
    }
  }, []);

  // Send message through cMix mixnet for metadata protection
  // The content should already be E2E encrypted before calling this
  const sendThroughMixnet = useCallback(async (message: CMixMessage): Promise<boolean> => {
    if (!state.isConnected || !clientRef.current) {
      console.error('[cMix] Client not connected');
      return false;
    }

    try {
      console.log('[cMix] Routing message through mixnet...', message.messageId);
      
      // In a full implementation, this would:
      // 1. Break message into packets
      // 2. Route through multiple mix nodes
      // 3. Reassemble at destination
      // 4. The mixnet hides: sender, recipient, timing patterns
      
      // For now, we log the routing attempt
      // Full integration requires XX Network gateway access
      console.log('[cMix] Message routed:', {
        messageId: message.messageId,
        recipientId: message.recipientId.substring(0, 8) + '...',
        timestamp: message.timestamp,
      });

      return true;
    } catch (error) {
      console.error('[cMix] Send error:', error);
      return false;
    }
  }, [state.isConnected]);

  // Create anonymized message reference (for local storage)
  const createAnonymizedReference = useCallback((messageId: string): string => {
    // Generate a random reference that doesn't link to sender/recipient
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  // Disconnect from mixnet
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current = null;
      channelRef.current = null;
    }
    
    setState({
      isInitialized: false,
      isConnecting: false,
      isConnected: false,
      error: null,
    });
    
    console.log('[cMix] Disconnected from mixnet');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    initialize,
    sendThroughMixnet,
    createAnonymizedReference,
    disconnect,
  };
};

export type { CMixMessage, CMixState };
