export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: PostStatus;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostData {
  title: string;
  body: string;
  tags: string[];
  status: PostStatus;
  scheduledAt: any; // Firestore Timestamp or null
}

export interface UpdatePostData {
  title?: string;
  body?: string;
  tags?: string[];
  status?: PostStatus;
  scheduledAt?: any; // Firestore Timestamp or null
}
