/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, db, storage } from '../firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadAvatar = async (uid: string, file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const filePath = `avatars/${uid}_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, filePath);
  
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const updateUserProfileData = async (
  uid: string, 
  data: { displayName?: string; bio?: string; username?: string; photoURL?: string }
) => {
  if (!auth.currentUser) throw new Error("Giriş yapılmış bir kullanıcı bulunamadı.");
  
  // Update Firebase Auth Profile (only displayName and photoURL if present)
  const authUpdates: any = {};
  if (data.displayName !== undefined) authUpdates.displayName = data.displayName;
  // Firebase Auth has a very low limit for photoURL, so skip if it's a huge base64 string
  if (data.photoURL !== undefined && !data.photoURL.startsWith('data:image/')) {
    authUpdates.photoURL = data.photoURL;
  }
  
  if (Object.keys(authUpdates).length > 0) {
    await updateProfile(auth.currentUser, authUpdates);
  }

  const userRef = doc(db, 'users', uid);
  // Update Firestore user document (filter out undefined values)
  const firestoreUpdates: any = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      firestoreUpdates[key] = value;
    }
  });
  
  if (Object.keys(firestoreUpdates).length > 0) {
    await updateDoc(userRef, firestoreUpdates);
  }
};

export const changeEmail = async (newEmail: string) => {
  if (!auth.currentUser) throw new Error("Giriş yapılmış bir kullanıcı bulunamadı.");
  await updateEmail(auth.currentUser, newEmail);
};

export const changePassword = async (newPassword: string) => {
  if (!auth.currentUser) throw new Error("Giriş yapılmış bir kullanıcı bulunamadı.");
  await updatePassword(auth.currentUser, newPassword);
};
