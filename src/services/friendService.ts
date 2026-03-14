import { collection, doc, getDoc, getDocs, query, setDoc, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Friendship, UserProfile } from '../types';

export const getFriendshipId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (!senderId || !receiverId) throw new Error("Gönderen veya alıcı kimliği eksik.");
  if (senderId === receiverId) throw new Error("Kendinize arkadaşlık isteği gönderemezsiniz.");

  const friendshipId = getFriendshipId(senderId, receiverId);
  const friendshipRef = doc(db, 'friendships', friendshipId);
  
  const docSnap = await getDoc(friendshipRef);
  if (docSnap.exists()) {
    throw new Error("Bu kullanıcıyla zaten bir bağlantınız var (İstek gönderilmiş, onaylanmış veya engellenmiş).");
  }

  const friendshipData: Partial<Friendship> = {
    id: friendshipId,
    user1Id: [senderId, receiverId].sort()[0],
    user2Id: [senderId, receiverId].sort()[1],
    status: 'pending',
    requesterId: senderId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await setDoc(friendshipRef, friendshipData);
};

export const acceptFriendRequest = async (friendshipId: string) => {
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await updateDoc(friendshipRef, {
    status: 'accepted',
    updatedAt: Date.now()
  });
};

export const rejectFriendRequest = async (friendshipId: string) => {
  const friendshipRef = doc(db, 'friendships', friendshipId);
  // Reddedilince tamamen siliyoruz ki gelecekte tekrar istek atılabilsin.
  // İstenirse 'rejected' yapılıp bekletilebilir ama silmek daha temiz bir UX sağlar.
  await deleteDoc(friendshipRef);
};

export const removeFriend = async (friendshipId: string) => {
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await deleteDoc(friendshipRef);
};

export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<UserProfile[]> => {
  if (!searchTerm || searchTerm.length < 3) return [];
  
  // Basit Firestore araması. Büyük harf / küçük harf duyarlılığını kısmak için 
  // username genellikle küçüktür.
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('username', '>=', searchTerm.toLowerCase()), 
    where('username', '<=', searchTerm.toLowerCase() + '\uf8ff')
  );

  const snapshot = await getDocs(q);
  const users: UserProfile[] = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data() as UserProfile;
    const uid = data.uid || docSnap.id;
    // Kendimizi aramada görmeyelim
    if (uid !== currentUserId) {
      users.push({ ...data, uid });
    }
  });

  return users;
};
