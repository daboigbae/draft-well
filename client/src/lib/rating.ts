import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export interface RatingResponse {
  rating: number;
  suggestions: string[];
}

export interface RatingRequest {
  draft: string;
}

export const getRating = async (draft: string): Promise<RatingResponse> => {
  const getRatingFunction = httpsCallable<RatingRequest, RatingResponse>(functions, 'getRating');
  
  const result = await getRatingFunction({ draft });
  return result.data;
};