import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
         try {
           const docRef = doc(db, 'users', user.uid);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
              setUserProfile(docSnap.data());
           } else {
              setUserProfile(null);
           }
         } catch(e) {
           console.error("Kullanıcı profili alınamadı:", e);
           setUserProfile(null);
         }
      } else {
         setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile, setLoading]);
}
