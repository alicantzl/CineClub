/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  limit,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Room } from '../types';

const ROOMS_COLLECTION = 'rooms';

export const setRoomMovie = async (roomId: string, movieDetails: { movieTitle?: string, backdropUrl?: string, moviePoster?: string, youtubeVideoId?: string, webUrl?: string, webAudioUrl?: string | null }) => {
  const { updateDoc, deleteField } = await import('firebase/firestore');
  try {
    // Build update payload - use deleteField() to truly remove webAudioUrl if not provided
    const updatePayload: Record<string, unknown> = {
      ...movieDetails,
      status: 'waiting',
      currentTimestamp: 0
    };
    // If no audio URL, delete the field from Firestore (not just set to null/undefined)
    if (!movieDetails.webAudioUrl) {
      updatePayload.webAudioUrl = deleteField();
    }
    // Similarly reset youtubeVideoId or webUrl when switching modes
    if (movieDetails.webUrl && !movieDetails.youtubeVideoId) {
      updatePayload.youtubeVideoId = deleteField();
    }
    if (movieDetails.youtubeVideoId && !movieDetails.webUrl) {
      updatePayload.webUrl = deleteField();
      updatePayload.webAudioUrl = deleteField();
    }
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), updatePayload);
  } catch (error) {
    console.error("Film ayarlanırken hata oluştu:", error);
    throw error;
  }
};

export const updatePlayback = async (roomId: string, isPlaying: boolean, currentTimestamp: number) => {
  const { updateDoc } = await import('firebase/firestore');
  try {
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      status: isPlaying ? 'playing' : 'paused',
      currentTimestamp
    });
  } catch (error) {
    console.error("Oynatma durumu güncellenirken hata oluştu:", error);
    throw error;
  }
};

// Create a new room
export const createRoom = async (roomData: Omit<Room, 'id' | 'createdAt' | 'activeUsersCount' | 'status'>) => {
  try {
    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
      ...roomData,
      createdAt: serverTimestamp(),
      activeUsersCount: 0,
      status: 'waiting'
    });
    return docRef.id;
  } catch (error) {
    console.error("Oda oluşturulurken hata oluştu:", error);
    throw error;
  }
};

// Delete a room
export const deleteRoom = async (roomId: string) => {
  const { deleteDoc } = await import('firebase/firestore');
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
  } catch (error) {
    console.error("Oda silinirken hata oluştu:", error);
    throw error;
  }
};

// Listen to all active rooms in real-time
export const subscribeToRooms = (callback: (rooms: Room[]) => void) => {
  const q = query(
    collection(db, ROOMS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: Room[] = [];
    snapshot.forEach((document) => {
      // Cast the document data to our Room interface
      const data = document.data();
      rooms.push({
        id: document.id,
        name: data.name,
        description: data.description,
        hostId: data.hostId,
        hostName: data.hostName,
        isPrivate: data.isPrivate,
        tags: data.tags || [],
        backdropUrl: data.backdropUrl,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        activeUsersCount: data.activeUsersCount || 0,
        status: data.status || 'waiting',
        movieTitle: data.movieTitle,
        moviePoster: data.moviePoster,
        youtubeVideoId: data.youtubeVideoId,
        webUrl: data.webUrl,
        webAudioUrl: data.webAudioUrl,
        currentTimestamp: data.currentTimestamp,
        activePoll: data.activePoll
      } as Room);
    });
    callback(rooms);
  });
};

export const subscribeToRoom = (roomId: string, callback: (room: Room | null) => void) => {
  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  return onSnapshot(docRef, (docSnap: any) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        name: data.name,
        description: data.description,
        hostId: data.hostId,
        hostName: data.hostName,
        isPrivate: data.isPrivate,
        tags: data.tags || [],
        backdropUrl: data.backdropUrl,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        activeUsersCount: data.activeUsersCount || 0,
        status: data.status || 'waiting',
        movieTitle: data.movieTitle,
        moviePoster: data.moviePoster,
        youtubeVideoId: data.youtubeVideoId,
        webUrl: data.webUrl,
        webAudioUrl: data.webAudioUrl,
        currentTimestamp: data.currentTimestamp,
        activePoll: data.activePoll
      } as Room);
    } else {
      callback(null);
    }
  }, (error: any) => {
     console.error("Single room subscription error:", error);
  });
};

export const startPoll = async (roomId: string, question: string, options: string[], userId: string) => {
  const { updateDoc } = await import('firebase/firestore');
  try {
    const pollId = Date.now().toString();
    const formattedOptions = options.map((opt, i) => ({
      id: `${pollId}-${i}`,
      text: opt,
      votes: []
    }));

    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      activePoll: {
        id: pollId,
        question,
        options: formattedOptions,
        createdBy: userId,
        createdAt: Date.now(),
        isActive: true
      }
    });
  } catch (error) {
    console.error("Anket baslatilirken hata oluştu:", error);
    throw error;
  }
};

export const votePoll = async (roomId: string, optionId: string, userId: string, currentPoll: any) => {
  const { updateDoc } = await import('firebase/firestore');
  try {
    const newOptions = currentPoll.options.map((opt: any) => {
      const votesWithoutUser = opt.votes.filter((id: string) => id !== userId);
      if (opt.id === optionId) {
        return { ...opt, votes: [...votesWithoutUser, userId] };
      }
      return { ...opt, votes: votesWithoutUser };
    });

    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      'activePoll.options': newOptions
    });
  } catch (error) {
    console.error("Oy kullanilirken hata oluştu:", error);
    throw error;
  }
};

export const endPoll = async (roomId: string) => {
  const { updateDoc } = await import('firebase/firestore');
  try {
    // Set isActive to false instead of deleting it, so users can see final results easily.
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      'activePoll.isActive': false
    });
  } catch (error) {
    console.error("Anket bitirilirken hata oluştu:", error);
    throw error;
  }
};
