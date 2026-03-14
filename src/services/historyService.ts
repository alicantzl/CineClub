/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface WatchHistoryEntry {
  id?: string;
  roomId: string;
  mediaTitle: string;    // Only the title of the movie/video to keep DB small
  participants: string[]; // List of UIDs who were in the room
  watchedAt: any;        // Firestore Timestamp
}

// Minimal verilerle izleme geçmişini kaydet (Database'i şişirmemek için)
export const logWatchHistory = async (roomId: string, mediaTitle: string, participants: string[]) => {
  try {
    // Sadece eğer gerçekten izleyen varsa ve izlenen bir başlık (film/video) varsa kaydet.
    if (!mediaTitle || participants.length < 1) return;

    // Geçmişte aynı oda için aynı filmin tekrar tekrar kaydedilmesini önlemek isterseniz, 
    // veya sadece son 1 saat içerisindeyse kaydetme gibi bir sorgu yapılabilir, 
    // ancak şu an en basit ve performanslı olan doğruda insert atmaktır:
    
    // Yalnızca 2+ kişi varsa "Birlikte İzlenenler" (Shared history) anlamına gelir.
    // Yine de 1 kişi izlese bile bireysel geçmiş (Watch history) için tutulur.
    const historyRef = collection(db, 'watchHistory');
    await addDoc(historyRef, {
      roomId,
      mediaTitle,
      participants,
      watchedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Geçmiş kaydedilirken hata oluştu:", error);
  }
};

// Belirli bir kullanıcının ve arkadaşının ORTAK (Birlikte) izlediği geçmişi en son tarihe göre getir.
export const getSharedWatchHistory = async (userId1: string, userId2: string) => {
  try {
    const historyRef = collection(db, 'watchHistory');
    
    // Firestore'da array-contains sadece tek bir eleman arayabilir.
    // Hem userId1 hem userId2'nin participants'da olma şartı için;
    // Basit bir kural: userId1 array-contains ile seçilir, client tarafında userId2 filtrelenir.
    // Veya Firestore'a participants_map gibi daha gelişmiş indexler kurulabilir ama uygulamanız
    // için en kolay yöntem budur:
    const q = query(
      historyRef,
      where('participants', 'array-contains', userId1),
      orderBy('watchedAt', 'desc'),
      limit(20) // Performans için sadece son 20 ortak izlemeyi çekelim
    );

    const snapshot = await getDocs(q);
    
    const sharedHistory: WatchHistoryEntry[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      // Client-side filtering for user2
      if (data.participants && data.participants.includes(userId2)) {
         sharedHistory.push({ id: docSnap.id, ...data } as WatchHistoryEntry);
      }
    });

    return sharedHistory;
  } catch (error) {
    console.error("Ortak izleme geçmişi getirilirken hata:", error);
    return [];
  }
};
