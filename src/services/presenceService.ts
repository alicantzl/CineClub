import { ref, onValue, set, onDisconnect, remove } from 'firebase/database';
import { rtdb } from '../firebase';
import type { OnlineUser } from '../types';

export const joinRoomPresence = async (
  roomId: string, 
  user: { uid: string; displayName: string | null; photoURL: string | null }
) => {
  if (!user.uid) return;
  const userRef = ref(rtdb, `rooms/${roomId}/users/${user.uid}`);
  
  const onlineUser: OnlineUser = {
    uid: user.uid,
    displayName: user.displayName || 'Anonim',
    photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName?.charAt(0) || 'A'}&background=1e293b&color=fff`,
    joinedAt: Date.now()
  };

  // Configure onDisconnect FIRST before setting the value
  // If connection drops, this child node will be removed
  await onDisconnect(userRef).remove();
  
  // Set the user as online
  await set(userRef, onlineUser);
};

export const leaveRoomPresence = async (roomId: string, userId: string) => {
  if (!userId) return;
  const userRef = ref(rtdb, `rooms/${roomId}/users/${userId}`);
  
  try {
    // Optionally cancel onDisconnect if leaving gracefully
    onDisconnect(userRef).cancel();
  } catch (e) {
    console.error("onDisconnect cancel error", e);
  }

  // Remove the node
  await remove(userRef);
};

export const subscribeToRoomUsers = (roomId: string, callback: (users: OnlineUser[]) => void) => {
  const roomUsersRef = ref(rtdb, `rooms/${roomId}/users`);
  
  const unsubscribe = onValue(roomUsersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const users: OnlineUser[] = Object.values(data);
      // Sort by join time
      callback(users.sort((a, b) => a.joinedAt - b.joinedAt));
    } else {
      callback([]);
    }
  });

  return () => unsubscribe();
};
