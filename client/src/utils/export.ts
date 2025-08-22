import { Post } from "../types/post";

export const exportPostAsText = (post: Post): void => {
  const content = `${post.title}\n\n${post.body}\n\nTags: ${post.tags.join(", ")}\nStatus: ${post.status}\nCreated: ${post.createdAt.toLocaleDateString()}\nUpdated: ${post.updatedAt.toLocaleDateString()}`;
  
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${post.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const exportMultiplePostsAsText = (posts: Post[]): void => {
  const content = posts
    .map(post => `${post.title}\n${"=".repeat(post.title.length)}\n\n${post.body}\n\nTags: ${post.tags.join(", ")}\nStatus: ${post.status}\nCreated: ${post.createdAt.toLocaleDateString()}\nUpdated: ${post.updatedAt.toLocaleDateString()}\n\n${"─".repeat(50)}\n\n`)
    .join("");
  
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `linkedraft_posts_${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
