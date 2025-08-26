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
  where,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "../firebase";
import { Post, PostStatus, CreatePostData, UpdatePostData } from "../types/post";

const getPostsCollection = (userId: string) => 
  collection(db, `users/${userId}/posts`);

const getPostDoc = (userId: string, postId: string) => 
  doc(db, `users/${userId}/posts/${postId}`);

export const createPost = async (userId: string, data: CreatePostData): Promise<string> => {
  const postsRef = getPostsCollection(userId);
  const docRef = await addDoc(postsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updatePost = async (userId: string, postId: string, data: UpdatePostData): Promise<void> => {
  const postRef = getPostDoc(userId, postId);
  await updateDoc(postRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deletePost = async (userId: string, postId: string): Promise<void> => {
  const postRef = getPostDoc(userId, postId);
  await deleteDoc(postRef);
};

export const getPost = async (userId: string, postId: string): Promise<Post | null> => {
  const postRef = getPostDoc(userId, postId);
  const docSnap = await getDoc(postRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      scheduledAt: data.scheduledAt?.toDate() || null,
      aiRated: data.aiRated || false,
    } as Post;
  }
  
  return null;
};

export const getPosts = async (userId: string): Promise<Post[]> => {
  const postsRef = getPostsCollection(userId);
  const q = query(postsRef, orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      scheduledAt: data.scheduledAt?.toDate() || null,
      aiRated: data.aiRated || false,
    } as Post;
  });
};

export const getPostsByStatus = async (userId: string, status: PostStatus): Promise<Post[]> => {
  const postsRef = getPostsCollection(userId);
  const q = query(
    postsRef, 
    where("status", "==", status), 
    orderBy("updatedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      scheduledAt: data.scheduledAt?.toDate() || null,
      aiRated: data.aiRated || false,
    } as Post;
  });
};

export const subscribeToUserPosts = (
  userId: string, 
  callback: (posts: Post[]) => void
): (() => void) => {
  const postsRef = getPostsCollection(userId);
  const q = query(postsRef, orderBy("updatedAt", "desc"));
  
  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        scheduledAt: data.scheduledAt?.toDate() || null,
        aiRated: data.aiRated || false,
      } as Post;
    });
    callback(posts);
  });
};

export const duplicatePost = async (userId: string, postId: string): Promise<string> => {
  const originalPost = await getPost(userId, postId);
  if (!originalPost) {
    throw new Error("Post not found");
  }

  const duplicateData: CreatePostData = {
    title: `Copy of ${originalPost.title}`,
    body: originalPost.body,
    tags: [...originalPost.tags],
    status: "draft",
    scheduledAt: null,
    aiRated: false,
  };

  return createPost(userId, duplicateData);
};

export const schedulePost = async (userId: string, postId: string, scheduledAt: Date): Promise<void> => {
  await updatePost(userId, postId, {
    status: "scheduled",
    scheduledAt: Timestamp.fromDate(scheduledAt),
  });
};

export const publishPost = async (userId: string, postId: string): Promise<void> => {
  await updatePost(userId, postId, {
    status: "published",
    scheduledAt: null,
  });
};

// Get all unique tags from user's posts for auto-complete
export const getUserTags = async (userId: string): Promise<string[]> => {
  const postsRef = getPostsCollection(userId);
  const querySnapshot = await getDocs(postsRef);
  
  const allTags = new Set<string>();
  
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  
  return Array.from(allTags).sort();
};

// Subscribe to user tags for real-time updates
export const subscribeToUserTags = (
  userId: string, 
  callback: (tags: string[]) => void
): (() => void) => {
  const postsRef = getPostsCollection(userId);
  const q = query(postsRef, orderBy("updatedAt", "desc"));
  
  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const allTags = new Set<string>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    
    callback(Array.from(allTags).sort());
  });
};
