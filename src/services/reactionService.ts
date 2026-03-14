import { ref, push, onChildAdded, remove, DataSnapshot } from 'firebase/database';
import { rtdb } from '../firebase';

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

// Odaya yeni bir reaksiyon gönder
export const sendReaction = async (
  roomId: string, 
  reaction: Omit<Reaction, 'id' | 'timestamp'>
) => {
  const reactionsRef = ref(rtdb, `rooms/${roomId}/reactions`);
  await push(reactionsRef, {
    ...reaction,
    timestamp: Date.now()
  });
};

// Odaya atılan reaksiyonları dinle
export const subscribeToReactions = (
  roomId: string, 
  callback: (reaction: Reaction) => void
) => {
  const reactionsRef = ref(rtdb, `rooms/${roomId}/reactions`);
  
  const unsubscribe = onChildAdded(reactionsRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      // Reaksiyon eklendiği an UI'a gönderiyoruz
      callback({
        id: snapshot.key as string,
        ...data
      });
      
      // Performans için RTDB'den hemen veya kısa süre sonra silebiliriz, 
      // çünkü tepkiler anlık ekranda uçup gidecek kalıcı veriler değillerdir.
      // Ekranda gözüktükten hemen sonra veritabanından siliyoruz ki şişmesin.
      setTimeout(() => {
        remove(snapshot.ref).catch((err) => console.log('Reaksiyon temizlenemedi:', err));
      }, 5000); // 5 saniye sonra db'den sil (her ihtimale karşı UI'ın yakalaması bitene kadar bekler)
    }
  });

  return unsubscribe;
};
