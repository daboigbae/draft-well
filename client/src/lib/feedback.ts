import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface FeedbackData {
  email: string;
  text: string;
  createdAt: Date;
}

export interface CreateFeedbackData {
  email: string;
  text: string;
}

// Collection reference for feedback
const getFeedbackCollection = () => 
  collection(db, 'feedback');

export async function createFeedback(feedbackData: CreateFeedbackData): Promise<void> {
  const feedbackCollection = getFeedbackCollection();
  
  await addDoc(feedbackCollection, {
    ...feedbackData,
    createdAt: serverTimestamp(),
  });
}