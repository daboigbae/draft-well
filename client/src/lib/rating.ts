// COMMENTED OUT: Paid feature - AI Rating system with usage limits
// This functionality will be uncommented when implementing paid features

/*
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { canUserUseAiRating, getUserSubscription } from './subscription';

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
*/

// Simple interfaces for free users (no AI rating functionality)
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

// Disabled AI rating for free users
export const getRating = async (draft: string, postId: string, userId: string): Promise<RatingResponse> => {
  return {
    success: false,
    error: 'AI rating feature is currently disabled',
    message: 'AI rating functionality is not available in the free version.'
  };
};