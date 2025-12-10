// ========================================
// WELLIO HEALTH - SECURE CHAT API (xx/cMixx ready)
// One-file scaffold: transport + crypto + client + React hook
// ========================================

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// ---------- ROLES & TYPES ----------------

export type SecureChatRole = "individual" | "coach" | "clinician";

export interface SecureConversationId {
  id: string;          // opaque UUID/string; no PHI baked in
}

export interface SecureChatPeer {
  userId: string;      // Supabase profile id
  role: SecureChatRole;
  displayName?: string;
  publicKey?: string;  // PQ public key for this peer (ML-KEM-768, etc.)
}

export interface SecureChatMessageCiphertext {
  id: string;
  conversationId: string;
  senderId: string;
  createdAt: string; // ISO
  // ciphertext & metadata blobs; server never sees plaintext
  ciphertext: string;       // base64 or hex
  nonce: string;            // base64 or hex
  kemCiphertext?: string;   // optional, if using per-message KEM
  version: number;          // crypto protocol version
}

export interface SecureChatMessagePlaintext {
  id: string;
  conversationId: string;
  senderId: string;
  createdAt: Date;
  text: string;
  // Optional: later add attachments, structured payloads, etc.
}

// ---------- TRANSPORT LAYER (xx / cMixx) ---

/**
 * Transport is responsible only for moving opaque ciphertext blobs between parties.
 * In production this will talk to xx network's cMixx via xxdk.
 */
export interface ISecureTransport {
  send(opts: {
    conversationId: string;
    recipientUserId: string;
    payload: Uint8Array;
  }): Promise<void>;

  subscribe(opts: {
    conversationId: string;
    onMessage: (event: {
      senderId: string;
      payload: Uint8Array;
      receivedAt: Date;
    }) => void;
  }): () => void; // unsubscribe
}

/**
 * Placeholder transport that does nothing.
 * In real implementation, replace with xxdk / cMixx client.
 */
export const NoopTransport: ISecureTransport = {
  async send() {
    console.warn("[SecureTransport] send called but transport not implemented.");
  },
  subscribe() {
    console.warn("[SecureTransport] subscribe called but transport not implemented.");
    return () => {};
  },
};

// ---------- CRYPTO LAYER (PQ + symmetric) -

export interface ISecureCrypto {
  /**
   * Encrypt a UTF-8 message string for a given conversation & peer.
   * Uses PQ KEM (e.g. ML-KEM-768) + AES-256-GCM (or similar).
   */
  encryptMessage(opts: {
    plaintext: string;
    conversationId: string;
    selfUserId: string;
    peer: SecureChatPeer;
  }): Promise<{
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    kemCiphertext?: Uint8Array;
    version: number;
  }>;

  /**
   * Decrypt a received ciphertext blob.
   */
  decryptMessage(opts: {
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    kemCiphertext?: Uint8Array;
    version: number;
    conversationId: string;
    selfUserId: string;
    peer: SecureChatPeer;
    senderId: string;
  }): Promise<string>; // plaintext UTF-8
}

/**
 * Placeholder crypto that does NO REAL ENCRYPTION.
 * DO NOT USE IN PRODUCTION.
 * Replace with your PQ + symmetric crypto stack.
 */
export const InsecureCrypto: ISecureCrypto = {
  async encryptMessage({ plaintext }) {
    const encoder = new TextEncoder();
    const payload = encoder.encode(plaintext);
    return {
      ciphertext: payload,
      nonce: new Uint8Array(0),
      version: 1,
    };
  },
  async decryptMessage({ ciphertext }) {
    const decoder = new TextDecoder();
    return decoder.decode(ciphertext);
  },
};

// ---------- PERSISTENCE (Supabase) --------

/**
 * Supabase table: secure_messages
 * NOTE: Table must be created via migration before use.
 *
 * create table secure_messages (
 *   id uuid primary key default gen_random_uuid(),
 *   conversation_id uuid not null,
 *   sender_id uuid not null references profiles (id),
 *   created_at timestamptz not null default now(),
 *   ciphertext text not null,
 *   nonce text not null,
 *   kem_ciphertext text,
 *   version int not null default 1
 * );
 *
 * RLS ensures:
 * - only participants in the conversation can read rows
 * - no one can update/delete others' messages
 */

async function fetchConversationMessages(
  conversationId: string
): Promise<SecureChatMessageCiphertext[]> {
  // Using 'any' type assertion since table doesn't exist in types yet
  const { data, error } = await (supabase as any)
    .from("secure_messages")
    .select("id, conversation_id, sender_id, created_at, ciphertext, nonce, kem_ciphertext, version")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    createdAt: row.created_at as string,
    ciphertext: row.ciphertext as string,
    nonce: row.nonce as string,
    kemCiphertext: row.kem_ciphertext as string | undefined,
    version: row.version as number,
  }));
}

async function persistMessageCiphertext(row: {
  conversationId: string;
  senderId: string;
  ciphertext: string;
  nonce: string;
  kemCiphertext?: string;
  version: number;
}): Promise<string> {
  // Using 'any' type assertion since table doesn't exist in types yet
  const { data, error } = await (supabase as any)
    .from("secure_messages")
    .insert({
      conversation_id: row.conversationId,
      sender_id: row.senderId,
      ciphertext: row.ciphertext,
      nonce: row.nonce,
      kem_ciphertext: row.kemCiphertext ?? null,
      version: row.version,
    })
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data?.id as string;
}

// ---------- SECURE CHAT CLIENT ------------

export interface SecureChatClientOptions {
  transport?: ISecureTransport;
  crypto?: ISecureCrypto;
}

export class SecureChatClient {
  private transport: ISecureTransport;
  private crypto: ISecureCrypto;

  constructor(opts?: SecureChatClientOptions) {
    this.transport = opts?.transport ?? NoopTransport;
    this.crypto = opts?.crypto ?? InsecureCrypto;
  }

  async loadHistory(opts: {
    conversationId: string;
    self: { userId: string };
    peer: SecureChatPeer;
  }): Promise<SecureChatMessagePlaintext[]> {
    const rows = await fetchConversationMessages(opts.conversationId);

    const messages: SecureChatMessagePlaintext[] = [];
    for (const row of rows) {
      try {
        const plaintext = await this.crypto.decryptMessage({
          ciphertext: base64ToBytes(row.ciphertext),
          nonce: base64ToBytes(row.nonce),
          kemCiphertext: row.kemCiphertext
            ? base64ToBytes(row.kemCiphertext)
            : undefined,
          version: row.version,
          conversationId: row.conversationId,
          selfUserId: opts.self.userId,
          peer: opts.peer,
          senderId: row.senderId,
        });

        messages.push({
          id: row.id,
          conversationId: row.conversationId,
          senderId: row.senderId,
          createdAt: new Date(row.createdAt),
          text: plaintext,
        });
      } catch (err) {
        console.warn("[SecureChat] Failed to decrypt message", err);
      }
    }

    return messages;
  }

  async sendMessage(opts: {
    conversationId: string;
    self: { userId: string };
    peer: SecureChatPeer;
    text: string;
  }): Promise<SecureChatMessagePlaintext> {
    const { ciphertext, nonce, kemCiphertext, version } =
      await this.crypto.encryptMessage({
        plaintext: opts.text,
        conversationId: opts.conversationId,
        selfUserId: opts.self.userId,
        peer: opts.peer,
      });

    // 1) send via cMixx transport (xx network)
    await this.transport.send({
      conversationId: opts.conversationId,
      recipientUserId: opts.peer.userId,
      payload: ciphertext,
    });

    // 2) persist ciphertext for history
    const id = await persistMessageCiphertext({
      conversationId: opts.conversationId,
      senderId: opts.self.userId,
      ciphertext: bytesToBase64(ciphertext),
      nonce: bytesToBase64(nonce),
      kemCiphertext: kemCiphertext
        ? bytesToBase64(kemCiphertext)
        : undefined,
      version,
    });

    return {
      id,
      conversationId: opts.conversationId,
      senderId: opts.self.userId,
      createdAt: new Date(),
      text: opts.text,
    };
  }

  subscribe(opts: {
    conversationId: string;
    self: { userId: string };
    peer: SecureChatPeer;
    onMessage: (msg: SecureChatMessagePlaintext) => void;
  }): () => void {
    return this.transport.subscribe({
      conversationId: opts.conversationId,
      onMessage: async (event) => {
        try {
          const plaintext = await this.crypto.decryptMessage({
            ciphertext: event.payload,
            nonce: new Uint8Array(0), // TODO: handle nonce from transport or external metadata
            kemCiphertext: undefined,
            version: 1,
            conversationId: opts.conversationId,
            selfUserId: opts.self.userId,
            peer: opts.peer,
            senderId: event.senderId,
          });

          const msg: SecureChatMessagePlaintext = {
            id: crypto.randomUUID(),
            conversationId: opts.conversationId,
            senderId: event.senderId,
            createdAt: event.receivedAt,
            text: plaintext,
          };

          opts.onMessage(msg);
        } catch (err) {
          console.warn("[SecureChat] Failed to decrypt incoming transport msg", err);
        }
      },
    });
  }
}

// ---------- REACT HOOK: useSecureChat -------

export interface UseSecureChatOptions {
  conversationId: string;
  peer: SecureChatPeer;
  client?: SecureChatClient;
}

export function useSecureChat(opts: UseSecureChatOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<SecureChatMessagePlaintext[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () => opts.client ?? new SecureChatClient(),
    [opts.client]
  );

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Load history
  useEffect(() => {
    if (!user?.id) return;
    
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const history = await client.loadHistory({
          conversationId: opts.conversationId,
          self: { userId: user!.id },
          peer: opts.peer,
        });
        if (!cancelled) {
          setMessages(history);
        }
      } catch (err: any) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [client, opts.conversationId, opts.peer, user?.id]);

  // Subscribe to realtime incoming messages via transport
  useEffect(() => {
    if (!user?.id) return;
    
    const unsubscribe = client.subscribe({
      conversationId: opts.conversationId,
      self: { userId: user.id },
      peer: opts.peer,
      onMessage: (msg) => {
        setMessages((prev) => {
          // simple append; you could dedupe by id if needed
          return [...prev, msg];
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [client, opts.conversationId, opts.peer, user?.id]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !user?.id) return;
      const msg = await client.sendMessage({
        conversationId: opts.conversationId,
        self: { userId: user.id },
        peer: opts.peer,
        text,
      });
      setMessages((prev) => [...prev, msg]);
    },
    [client, opts.conversationId, opts.peer, user?.id]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}

// ---------- UTILS: base64 helpers -----------

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof window !== "undefined" && window.btoa) {
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  }
  // Node-style fallback
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(b64: string): Uint8Array {
  if (!b64) return new Uint8Array(0);
  if (typeof window !== "undefined" && window.atob) {
    const binary = window.atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  // Node-style fallback
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ========================================
// END SECURE CHAT API SCAFFOLD
// ========================================
