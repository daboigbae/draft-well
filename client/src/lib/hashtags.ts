import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { HashtagCollection, CreateHashtagCollectionData, UpdateHashtagCollectionData } from "../types/hashtag";

const getUserDoc = (userId: string) => doc(db, `users/${userId}`);

// Helper function to generate a unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const createHashtagCollection = async (userId: string, data: CreateHashtagCollectionData): Promise<string> => {
  const userDocRef = getUserDoc(userId);
  const userDoc = await getDoc(userDocRef);
  
  const newId = generateId();
  const newCollection: HashtagCollection = {
    id: newId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  let existingCollections: HashtagCollection[] = [];
  if (userDoc.exists()) {
    existingCollections = userDoc.data()?.hashtagCollections || [];
  }
  
  const updatedCollections = [...existingCollections, newCollection];
  
  await updateDoc(userDocRef, {
    hashtagCollections: updatedCollections,
    updatedAt: serverTimestamp(),
  });
  
  return newId;
};

export const updateHashtagCollection = async (userId: string, collectionId: string, data: UpdateHashtagCollectionData): Promise<void> => {
  const userDocRef = getUserDoc(userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) return;
  
  const collections: HashtagCollection[] = userDoc.data()?.hashtagCollections || [];
  const updatedCollections = collections.map(collection => 
    collection.id === collectionId 
      ? { ...collection, ...data, updatedAt: new Date() }
      : collection
  );
  
  await updateDoc(userDocRef, {
    hashtagCollections: updatedCollections,
    updatedAt: serverTimestamp(),
  });
};

export const deleteHashtagCollection = async (userId: string, collectionId: string): Promise<void> => {
  const userDocRef = getUserDoc(userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) return;
  
  const collections: HashtagCollection[] = userDoc.data()?.hashtagCollections || [];
  const updatedCollections = collections.filter(collection => collection.id !== collectionId);
  
  await updateDoc(userDocRef, {
    hashtagCollections: updatedCollections,
    updatedAt: serverTimestamp(),
  });
};

export const getHashtagCollection = async (userId: string, collectionId: string): Promise<HashtagCollection | null> => {
  const userDocRef = getUserDoc(userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) return null;
  
  const collections: HashtagCollection[] = userDoc.data()?.hashtagCollections || [];
  return collections.find(collection => collection.id === collectionId) || null;
};

export const getHashtagCollections = async (userId: string): Promise<HashtagCollection[]> => {
  const userDocRef = getUserDoc(userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) return [];
  
  const collections: HashtagCollection[] = userDoc.data()?.hashtagCollections || [];
  return collections.sort((a, b) => a.name.localeCompare(b.name));
};

export const subscribeToHashtagCollections = (
  userId: string, 
  callback: (collections: HashtagCollection[]) => void
): (() => void) => {
  const userDocRef = getUserDoc(userId);
  
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      const collections: HashtagCollection[] = doc.data()?.hashtagCollections || [];
      callback(collections.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error in hashtag collections subscription:", error);
    callback([]);
  });
};