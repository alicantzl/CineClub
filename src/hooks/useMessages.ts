import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Message } from '../types';
import { useAuthStore } from '../store/authStore';

export const useMessages = (chatId: string | null) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
       
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgList = snapshot.docs.map((d) => ({
          ...(d.data() as Omit<Message, 'id'>),
          id: d.id,
        })) as Message[];
        setMessages(msgList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (text: string) => {
    if (!chatId || !user) throw new Error('No chat or user');

    // Add the message to the subcollection
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      read: false,
    });

    // Update parent chat document with last message info
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
    });
  };

  return { messages, loading, sendMessage };
};
