export type PostStatus = "draft" | "published" | "scheduled";

export interface Post {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: PostStatus;
  scheduledAt: Date | null;
  aiRated: boolean;
  rating?: number;
  suggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostData {
  title: string;
  body: string;
  tags: string[];
  status: PostStatus;
  scheduledAt: any; // Firestore Timestamp or null
  aiRated: boolean;
}

export interface UpdatePostData {
  title?: string;
  body?: string;
  tags?: string[];
  status?: PostStatus;
  scheduledAt?: any; // Firestore Timestamp or null
  aiRated?: boolean;
}
