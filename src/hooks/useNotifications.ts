/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, or, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import type { Chat, Friendship } from '../types';

export interface NotificationItem {
  id: string;
  type: 'message' | 'friend_request';
  title: string;
  body: string;
  timestamp: number;
  data?: any;
  isRead: boolean;
}

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadMessageCount(0);
      setPendingRequestCount(0);
      return;
    }

    let isFirstMessageLoad = true;
    const notificationSound = new Audio('/sounds/notification.mp3');

    // 1. Dinleyici: Okunmamış Mesajlar (Chats)
    const chatsRef = collection(db, 'chats');
    const qChats = query(chatsRef, where('participants', 'array-contains', user.uid));
    
    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      let unreadCount = 0;
      const messageNotifs: NotificationItem[] = [];
      let playSound = false;

      snapshot.docs.forEach((doc) => {
        const chatData = doc.data() as Chat;
        // participants array kontrolü, güvenliği sağlama
        if (!chatData.participants || !chatData.participants.includes(user.uid)) return;

        const unreadForMe = chatData.unreadCount?.[user.uid] || 0;
        
        if (unreadForMe > 0) {
          unreadCount += unreadForMe;
          
          if (!isFirstMessageLoad && chatData.lastMessageTime) {
             playSound = true;
          }
        }

        // Göstermek için sadece içi dolu sohbetleri alalım.
        // Bildirim geçmişinde görünsün (okunmuş olsa bile)
        if (chatData.lastMessage) {
          const otherUserId = chatData.participants.find(p => p !== user.uid) || 'Bilinmeyen';
          const lastMessageTime = chatData.lastMessageTime as unknown;
          const lastMessageMillis =
            lastMessageTime instanceof Timestamp
              ? lastMessageTime.toMillis()
              : typeof (lastMessageTime as { toMillis?: unknown } | null)?.toMillis === 'function'
                ? (lastMessageTime as { toMillis: () => number }).toMillis()
                : typeof lastMessageTime === 'number'
                  ? lastMessageTime
                  : Date.now();
          messageNotifs.push({
            id: `msg_${chatData.id}`,
            type: 'message',
            title: unreadForMe > 0 ? 'Yeni Mesaj' : 'Mesaj',
            body: chatData.lastMessage,
            timestamp: lastMessageMillis,
            isRead: unreadForMe === 0,
            data: { chatId: chatData.id, otherUserId }
          });
        }
      });

      if (playSound && !isFirstMessageLoad) {
        notificationSound.play().catch(e => console.error("Ses oynatılamadı", e));
      }
      isFirstMessageLoad = false;
      setUnreadMessageCount(unreadCount);

      setNotifications(prev => {
        // Mevcut message bildirimlerini temizle ve yenilerini ekle
        const filtered = prev.filter(n => n.type !== 'message');
        return [...filtered, ...messageNotifs].sort((a, b) => b.timestamp - a.timestamp);
      });
    }, (error) => {
      console.error("Chats notification listener error:", error);
    });

    // 2. Dinleyici: Bekleyen Arkadaşlık İstekleri
    const friendshipsRef = collection(db, 'friendships');
    const qFriendships = query(
      friendshipsRef, 
      or(where('user1Id', '==', user.uid), where('user2Id', '==', user.uid))
    );

    const unsubscribeFriendships = onSnapshot(qFriendships, (snapshot) => {
      let pendingCount = 0;
      const requestNotifs: NotificationItem[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Friendship;
        if (data.status === 'pending' && data.requesterId !== user.uid) {
          pendingCount++;
          requestNotifs.push({
            id: `req_${data.id}`,
            type: 'friend_request',
            title: 'Yeni Arkadaşlık İsteği',
            body: `Birisi size arkadaşlık isteği gönderdi.`,
            timestamp: data.createdAt || Date.now(),
            isRead: false,
            data: { friendshipId: data.id, requesterId: data.requesterId }
          });
        }
      });

      setPendingRequestCount(pendingCount);
      setNotifications(prev => {
        const filtered = prev.filter(n => n.type !== 'friend_request');
        return [...filtered, ...requestNotifs].sort((a, b) => b.timestamp - a.timestamp);
      });
    }, (error) => {
        console.error("Friendships notification listener error:", error);
    });

    return () => {
      unsubscribeChats();
      unsubscribeFriendships();
    };
  }, [user?.uid]);

  const totalUnread = unreadMessageCount + pendingRequestCount;

  return {
    notifications,
    unreadMessageCount,
    pendingRequestCount,
    totalUnread
  };
}
