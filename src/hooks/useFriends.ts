 
import { useState, useEffect } from 'react';
import { collection, query, or, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Friendship, FriendUser, UserProfile } from '../types';
import { useAuthStore } from '../store/authStore';

export const useFriends = () => {
  const { user } = useAuthStore();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friendsList, setFriendsList] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendUser[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFriendships([]);
       
      setFriendsList([]);
       
      setPendingRequests([]);
       
      setSentRequests([]);
       
      setLoading(false);
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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedFriendships: Friendship[] = [];
      snapshot.forEach(doc => {
        fetchedFriendships.push(doc.data() as Friendship);
      });

      setFriendships(fetchedFriendships);

      // Extract unique user IDs of friends/requesters
      const otherUserIds = Array.from(new Set(
        fetchedFriendships.map(f => f.user1Id === user.uid ? f.user2Id : f.user1Id)
      ));
      
      const userProfilesMap = new Map<string, UserProfile>();
      
      // Fetch each user profile. (Can be optimized to run outside snapshot or via a global cache later if needed)
      await Promise.all(
        otherUserIds.map(async (id) => {
          try {
            const userDocSnap = await getDoc(doc(db, 'users', id));
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              userProfilesMap.set(id, {
                uid: data.uid || id,
                email: data.email || null,
                displayName: data.displayName || null,
                photoURL: data.photoURL || null,
                ...data
              } as UserProfile);
            }
          } catch (e) {
            console.error("Error fetching user profile for friend:", id, e);
          }
        })
      );

      const accepted: FriendUser[] = [];
      const pendingIncoming: FriendUser[] = [];
      const pendingOutgoing: FriendUser[] = [];

      fetchedFriendships.forEach(f => {
        const otherId = f.user1Id === user.uid ? f.user2Id : f.user1Id;
        const profile = userProfilesMap.get(otherId);
        
        if (profile) {
          const friendUser: FriendUser = {
            ...profile,
            uid: profile.uid || otherId,
            friendshipId: f.id,
            friendStatus: f.status,
            requesterId: f.requesterId
          };

          if (f.status === 'accepted') {
            accepted.push(friendUser);
          } else if (f.status === 'pending') {
            if (f.requesterId === user.uid) {
              pendingOutgoing.push(friendUser);
            } else {
              pendingIncoming.push(friendUser);
            }
          }
        }
      });

      setFriendsList(accepted);
      setPendingRequests(pendingIncoming);
      setSentRequests(pendingOutgoing);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to friends:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return {
    friendships,
    friendsList,
    pendingRequests,
    sentRequests,
    loading
  };
};
