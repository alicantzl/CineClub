/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Chat, UserProfile, FriendUser, Friendship } from '../types';
import { useAuthStore } from '../store/authStore';
import { or } from 'firebase/firestore';

export interface ChatWithUser extends Chat {
  otherUser?: UserProfile;
}

export const useChatList = () => {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to chats
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChats([]);
       
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Map docs, preserving id
        const chatList: Chat[] = snapshot.docs.map((d) => ({
          ...(d.data() as Omit<Chat, 'id'>),
          id: d.id,
        }));

        // Sort by lastMessageTime descending (avoid composite index)
        chatList.sort((a, b) => {
          const getMs = (time: any) => {
            if (!time) return 0;
            if (typeof time.toMillis === 'function') return time.toMillis();
            if (time instanceof Date) return time.getTime();
            if (time.seconds) return time.seconds * 1000;
            return 0;
          };
          return getMs(b.lastMessageTime) - getMs(a.lastMessageTime);
        });

        // Fetch other user's profile for each chat
        const chatsWithUsers: ChatWithUser[] = [];
        for (const chat of chatList) {
          const otherUserId = chat.participants.find((id) => id !== user.uid);
          let otherUser: UserProfile | undefined;
          if (otherUserId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                otherUser = userDoc.data() as UserProfile;
              }
            } catch (e) {
              console.error('Error fetching other user profile for chat', e);
            }
          }
          chatsWithUsers.push({ ...chat, otherUser });
        }

        setChats(chatsWithUsers);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching chat list:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to accepted friendships to compute filteredFriendsWithoutChat
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFriends([]);
      return;
    }

    const friendshipsRef = collection(db, 'friendships');
    const q = query(
      friendshipsRef,
      or(
        where('user1Id', '==', user.uid),
        where('user2Id', '==', user.uid)
      )
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const accepted: Friendship[] = [];
        snapshot.forEach((d) => {
          const f = d.data() as Friendship;
          if (f.status === 'accepted') accepted.push(f);
        });

        // Fetch profiles
        const result: FriendUser[] = [];
        await Promise.all(
          accepted.map(async (f) => {
            const otherId = f.user1Id === user.uid ? f.user2Id : f.user1Id;
            try {
              const snap = await getDoc(doc(db, 'users', otherId));
              if (snap.exists()) {
                const profile = snap.data() as UserProfile;
                result.push({
                  ...profile,
                  uid: profile.uid || otherId,
                  friendshipId: f.id,
                  friendStatus: f.status,
                  requesterId: f.requesterId,
                });
              }
            } catch (e) {
              console.error('Error fetching friend profile', e);
            }
          })
        );

        setFriends(result);
      },
      (error) => {
        console.error('Error fetching friendships for chat list:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Friends who don't yet have a chat with the current user
  const chatParticipantUids = new Set(
    chats.flatMap((c) => c.participants)
  );

  const filteredFriendsWithoutChat = friends.filter(
    (f) => !chatParticipantUids.has(f.uid)
  );

  return { chats, loading, filteredFriendsWithoutChat };
};
