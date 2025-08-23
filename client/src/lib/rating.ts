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
}

export const getRating = async (draft: string): Promise<RatingResponse> => {
  const getRatingFunction = httpsCallable<RatingRequest, RatingResponse>(functions, 'getRating');
  
  const result = await getRatingFunction({ draft });
  return result.data;
};