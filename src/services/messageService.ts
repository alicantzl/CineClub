/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  increment,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Chat } from '../types';

export const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const createOrGetChat = async (currentUserId: string, targetUserId: string) => {
  if (!currentUserId || !targetUserId) {
    throw new Error(`Geçersiz kullanıcı kimliği. current: ${currentUserId}, target: ${targetUserId}`);
  }

  const chatId = getChatId(currentUserId, targetUserId);
  const chatRef = doc(db, 'chats', chatId);
  
  const chatSnap = await getDoc(chatRef);
  
  if (!chatSnap.exists()) {
    const newChat: Partial<Chat> = {
      id: chatId,
      participants: [currentUserId, targetUserId],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadCount: {
        [currentUserId]: 0,
        [targetUserId]: 0
      }
    };
    await setDoc(chatRef, newChat);
  }
  
  return chatId;
};

export const sendMessage = async (chatId: string, senderId: string, text: string, receiverId: string) => {
  if (!text.trim()) return;

  // 1. Add message to subcollection
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
    read: false
  });

  // 2. Update chat document safely
  const chatRef = doc(db, 'chats', chatId);
  try {
    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${receiverId}`]: increment(1),
      participants: [senderId, receiverId] // Eksik verileri tamamla
    });
  } catch (error: any) {
    if (error.code === 'not-found') {
      await setDoc(chatRef, {
        id: chatId,
        participants: [senderId, receiverId],
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [senderId]: 0,
          [receiverId]: 1
        }
      });
    } else {
      console.error("Mesaj guncelleme hatasi:", error);
    }
  }
};

export const markMessagesAsRead = async (chatId: string, currentUserId: string) => {
  const chatRef = doc(db, 'chats', chatId);
  try {
    // Reset unread count for current user
    await updateDoc(chatRef, {
      [`unreadCount.${currentUserId}`]: 0
    });
  } catch (error: any) {
    if (error.code !== 'not-found') {
       console.error("Okundu bilgisi guncellenirken hata:", error);
    }
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const unreadQuery = query(messagesRef, where('read', '==', false));
    const querySnapshot = await getDocs(unreadQuery);
    
    if (!querySnapshot.empty) {
      const batch = writeBatch(db);
      let batchCount = 0;
      querySnapshot.forEach(docSnap => {
        if (docSnap.data().senderId !== currentUserId) {
          batch.update(docSnap.ref, { read: true });
          batchCount++;
        }
      });
      if (batchCount > 0) {
        await batch.commit();
      }
    }
  } catch (error) {
    console.error("Error updating read receipts:", error);
  }
};
