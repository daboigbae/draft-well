export interface HashtagCollection {
  id: string;
  userId: string;
  name: string;
  hashtags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHashtagCollectionData {
  name: string;
  hashtags: string[];
}

export interface UpdateHashtagCollectionData {
  name?: string;
  hashtags?: string[];
}