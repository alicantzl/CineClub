/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  createdAt: any;
}

export const sendMessage = async (roomId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  return addDoc(messagesRef, {
    ...message,
    createdAt: serverTimestamp()
  });
};

export const subscribeToMessages = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
};
