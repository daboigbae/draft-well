import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { canUserUseAiRating, getUserSubscription } from './subscription';

export interface RatingData {
  rating: number;
  feedback: string;
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
  // Check if user can use AI rating based on quota
  const quotaCheck = await canUserUseAiRating(userId);
  
  if (!quotaCheck.canUse) {
    return {
      success: false,
      error: quotaCheck.reason || 'Usage limit exceeded',
      message: `You've used ${quotaCheck.current} of ${quotaCheck.limit} AI ratings this month.`
    };
  }
  
  try {
    const getRatingFunction = httpsCallable<RatingRequest, RatingResponse>(functions, 'getRating');
    const result = await getRatingFunction({ draft, postId, userId });
    
    // Backend will handle usage tracking
    
    return result.data;
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to get rating',
      message: error.message || 'An unexpected error occurred'
    };
  }
};