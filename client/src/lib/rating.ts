import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export interface RatingData {
  rating: number;
  suggestions: string[];
}

export interface RatingResponse {
  success: boolean;
  data?: RatingData;
  error?: string;
  message?: string;
}

export interface RatingRequest {
  draft: string;
  postId: string;
  userId: string;
}

export const getRating = async (draft: string, postId: string, userId: string): Promise<RatingResponse> => {
  try {
    const getRatingFunction = httpsCallable<RatingRequest, RatingResponse>(functions, 'getRating');
    const result = await getRatingFunction({ draft, postId, userId });
    
    return result.data;
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to get rating',
      message: error.message || 'An unexpected error occurred'
    };
  }
};