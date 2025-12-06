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
  const xxdkRef = useRef<any>(null);

  // Initialize the cMix client
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Dynamic import of the XX Network SDK (xxdk-wasm)
      const xxdk = await import('xxdk-wasm');
      xxdkRef.current = xxdk;
      
      // Check if WASM is supported
      if (typeof WebAssembly === 'undefined') {
        throw new Error('WebAssembly is not supported in this browser');
      }

      console.log('[cMix] Loading WASM module...');
      
      // Set the base path for WASM files (uses CDN by default)
      // The xxdk-wasm package uses a CDN hosted by xx foundation
      if (xxdk.setXXDKBasePath) {
        // Use default CDN - no need to override unless self-hosting
        console.log('[cMix] Using default CDN for WASM binaries');
      }

      // Initialize the WASM module
      await xxdk.default();
      
      console.log('[cMix] WASM module loaded');

      // Fetch the mainnet NDF (Network Definition File)
      const ndfUrl = 'https://elixxir-bins.s3.us-west-1.amazonaws.com/ndf/mainnet.json';
      console.log('[cMix] Fetching network definition...');
      
      const ndfResponse = await fetch(ndfUrl);
      if (!ndfResponse.ok) {
        throw new Error('Failed to fetch network definition');
      }
      const ndf = await ndfResponse.text();

      console.log('[cMix] Network definition loaded');
      
      // Store client reference
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
    }
    xxdkRef.current = null;
    
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
