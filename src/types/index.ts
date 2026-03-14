 
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username?: string;
  bio?: string;
  status?: 'online' | 'offline' | string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  hostId: string;
  hostName: string;
  isPrivate: boolean;
  tags: string[];
  backdropUrl?: string; // e.g. TMDB backdrop image
  createdAt: number;
  activeUsersCount: number;
  status: 'waiting' | 'playing' | 'paused';
  movieTitle?: string;
  moviePoster?: string;
  youtubeVideoId?: string;
  webUrl?: string; // e.g. .mp4, .m3u8 direct links
  webAudioUrl?: string; // Optional separate audio track
  webSubtitleUrl?: string; // Optional subtitle track (.vtt or .srt)
  currentTimestamp?: number;
  activePoll?: Poll;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // array of user IDs
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
}

export interface OnlineUser {
  uid: string;
  displayName: string;
  photoURL: string;
  joinedAt: number;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string; // e.g. "uidA_uidB"
  user1Id: string;
  user2Id: string;
  status: FriendshipStatus;
  requesterId: string; // the user who initiated the request
  createdAt: number;
  updatedAt: number;
}

export interface FriendUser extends UserProfile {
  friendshipId: string;
  friendStatus: FriendshipStatus;
  requesterId: string;
  // This will store standard UserProfile plus context of how they are related
}

import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | FieldValue | null;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Timestamp | FieldValue | null;
  unreadCount?: Record<string, number>; // UID -> unread message count
}
