export interface Message {
  id: string;
  sender_id: string;
  content: string;
  content_encrypted?: string;
  encryption_version?: number;
  created_at: string;
  is_read: boolean;
}

export interface ConversationDetails {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string | null;
  other_user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}
