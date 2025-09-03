import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  User,
  AuthError,
  deleteUser as firebaseDeleteUser
} from "firebase/auth";
import { doc, deleteDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signInWithGoogle = async (): Promise<void> => {
  await signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const deleteUser = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const userId = user.uid;
  const batch = writeBatch(db);

  try {
    // Delete user document
    const userDocRef = doc(db, 'users', userId);
    batch.delete(userDocRef);

    // Delete all user posts
    const postsCollectionRef = collection(db, 'users', userId, 'posts');
    const postsSnapshot = await getDocs(postsCollectionRef);
    postsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all user hashtag collections
    const hashtagsCollectionRef = collection(db, 'users', userId, 'hashtagCollections');
    const hashtagsSnapshot = await getDocs(hashtagsCollectionRef);
    hashtagsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit all Firestore deletions
    await batch.commit();

    // Finally, delete the Firebase Auth user
    await firebaseDeleteUser(user);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};
