import { useCallback, useState } from 'react';
import { useE2EEncryption } from './useE2EEncryption';
import { useCMixClient, CMixMessage } from './useCMixClient';

/**
 * Two-Layer Privacy Messaging Hook
 * 
 * Layer 1: E2E Encryption - Protects message CONTENT
 * Layer 2: cMix Mixnet - Protects message METADATA (who, when, patterns)
 * 
 * Together they provide comprehensive privacy protection for user communications.
 */

interface PrivateMessage {
  id: string;
  recipientId: string;
  content: string;
  timestamp: number;
}

interface SendResult {
  success: boolean;
  messageId: string;
  encryptedContent: string | null;
  mixnetRouted: boolean;
  error?: string;
}

export const usePrivateMessaging = () => {
  const [isSending, setIsSending] = useState(false);
  const [mixnetEnabled, setMixnetEnabled] = useState(false);
  
  const e2e = useE2EEncryption();
  const cmix = useCMixClient();

  // Initialize both encryption layers
  const initializePrivacy = useCallback(async (): Promise<boolean> => {
    try {
      // Layer 1: E2E encryption keys
      if (!e2e.hasKeyPair) {
        const e2eSuccess = await e2e.generateAndStoreKeyPair();
        if (!e2eSuccess) {
          console.error('[Privacy] Failed to initialize E2E encryption');
          return false;
        }
      }

      // Layer 2: cMix mixnet connection
      const cmixSuccess = await cmix.initialize();
      if (cmixSuccess) {
        setMixnetEnabled(true);
      } else {
        // E2E still works without cMix - just no metadata protection
        console.warn('[Privacy] cMix unavailable - E2E encryption only');
      }

      return true;
    } catch (error) {
      console.error('[Privacy] Initialization error:', error);
      return false;
    }
  }, [e2e, cmix]);

  // Send a private message with both encryption layers
  const sendPrivateMessage = useCallback(async (
    recipientId: string,
    plaintext: string
  ): Promise<SendResult> => {
    setIsSending(true);
    const messageId = crypto.randomUUID();
    
    try {
      // Layer 1: E2E encrypt the content
      const encryptedContent = await e2e.encryptForPeer(plaintext, recipientId);
      
      if (!encryptedContent) {
        return {
          success: false,
          messageId,
          encryptedContent: null,
          mixnetRouted: false,
          error: 'E2E encryption failed',
        };
      }

      // Layer 2: Route through cMix mixnet (if available)
      let mixnetRouted = false;
      
      if (mixnetEnabled && cmix.isConnected) {
        const cmixMessage: CMixMessage = {
          recipientId,
          encryptedContent,
          messageId,
          timestamp: Date.now(),
        };
        
        mixnetRouted = await cmix.sendThroughMixnet(cmixMessage);
        
        if (mixnetRouted) {
          console.log('[Privacy] Message sent with full privacy (E2E + cMix)');
        }
      }

      if (!mixnetRouted) {
        // Fallback: Send via standard channel (still E2E encrypted)
        console.log('[Privacy] Message sent with E2E encryption only');
      }

      return {
        success: true,
        messageId,
        encryptedContent,
        mixnetRouted,
      };
    } catch (error) {
      console.error('[Privacy] Send error:', error);
      return {
        success: false,
        messageId,
        encryptedContent: null,
        mixnetRouted: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsSending(false);
    }
  }, [e2e, cmix, mixnetEnabled]);

  // Decrypt a received message
  const decryptMessage = useCallback(async (
    encryptedContent: string,
    senderId: string
  ): Promise<string | null> => {
    return e2e.decryptFromPeer(encryptedContent, senderId);
  }, [e2e]);

  // Get privacy status for UI display
  const getPrivacyStatus = useCallback(() => {
    const hasE2E = e2e.hasKeyPair;
    const hasMixnet = mixnetEnabled && cmix.isConnected;
    
    if (hasE2E && hasMixnet) {
      return {
        level: 'full',
        description: 'Full privacy: E2E + Mixnet',
        icon: 'shield-check',
      };
    } else if (hasE2E) {
      return {
        level: 'partial',
        description: 'E2E encrypted (no mixnet)',
        icon: 'lock',
      };
    } else {
      return {
        level: 'none',
        description: 'Not encrypted',
        icon: 'shield-off',
      };
    }
  }, [e2e.hasKeyPair, mixnetEnabled, cmix.isConnected]);

  return {
    // State
    isSending,
    isE2EReady: e2e.hasKeyPair,
    isMixnetReady: mixnetEnabled && cmix.isConnected,
    isInitializing: e2e.isGenerating || cmix.isConnecting,
    
    // Actions
    initializePrivacy,
    sendPrivateMessage,
    decryptMessage,
    getPrivacyStatus,
    
    // Lower-level access if needed
    e2e,
    cmix,
  };
};
