// Social-related type definitions

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  post_type?: string;
  visibility?: 'public' | 'followers' | 'close_friends' | 'private';
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_pinned?: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowRequest {
  id: string;
  requester_id: string;
  requested_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_private?: boolean;
  members_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role?: 'member' | 'admin' | 'moderator';
  joined_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_encrypted?: string;
  is_read?: boolean;
  is_encrypted?: boolean;
  encryption_version?: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read?: boolean;
  created_at: string;
}

export type PostVisibility = 'public' | 'followers' | 'close_friends' | 'private';