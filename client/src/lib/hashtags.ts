import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import { HashtagCollection, CreateHashtagCollectionData, UpdateHashtagCollectionData } from "../types/hashtag";

const getHashtagCollectionsCollection = (userId: string) => 
  collection(db, `users/${userId}/hashtagCollections`);

const getHashtagCollectionDoc = (userId: string, collectionId: string) => 
  doc(db, `users/${userId}/hashtagCollections/${collectionId}`);

export const createHashtagCollection = async (userId: string, data: CreateHashtagCollectionData): Promise<string> => {
  console.log("Creating hashtag collection:", data);
  console.log("Collection path:", `users/${userId}/hashtagCollections`);
  
  const collectionsRef = getHashtagCollectionsCollection(userId);
  const docRef = await addDoc(collectionsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log("Successfully created collection with ID:", docRef.id);
  return docRef.id;
};

export const updateHashtagCollection = async (userId: string, collectionId: string, data: UpdateHashtagCollectionData): Promise<void> => {
  const collectionRef = getHashtagCollectionDoc(userId, collectionId);
  await updateDoc(collectionRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteHashtagCollection = async (userId: string, collectionId: string): Promise<void> => {
  const collectionRef = getHashtagCollectionDoc(userId, collectionId);
  await deleteDoc(collectionRef);
};

export const getHashtagCollection = async (userId: string, collectionId: string): Promise<HashtagCollection | null> => {
  const collectionRef = getHashtagCollectionDoc(userId, collectionId);
  const docSnap = await getDoc(collectionRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as HashtagCollection;
  }
  
  return null;
};

export const getHashtagCollections = async (userId: string): Promise<HashtagCollection[]> => {
  const collectionsRef = getHashtagCollectionsCollection(userId);
  const q = query(collectionsRef, orderBy("name"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as HashtagCollection;
  });
};

export const subscribeToHashtagCollections = (
  userId: string, 
  callback: (collections: HashtagCollection[]) => void
): (() => void) => {
  console.log("Setting up hashtag collections subscription for user:", userId);
  const collectionsRef = getHashtagCollectionsCollection(userId);
  const q = query(collectionsRef, orderBy("name"));
  
  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    console.log("Got hashtag collections snapshot:", querySnapshot.docs.length, "collections");
    const collections = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as HashtagCollection;
    });
    callback(collections);
  }, (error) => {
    console.error("Error in hashtag collections subscription:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    // Return empty array on error to prevent infinite loading
    callback([]);
  });
};