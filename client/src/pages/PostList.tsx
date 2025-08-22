import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowUpDown, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import PostCard from "../components/PostCard";
import AppLayout from "./AppLayout";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post, PostStatus } from "../types/post";
import { subscribeToUserPosts, deletePost as deletePostFromDb, duplicatePost } from "../lib/posts";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentFilter, setCurrentFilter] = useState<PostStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Subscribe to user posts
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserPosts(user.uid, (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Filter and search posts
  useEffect(() => {
    let filtered = [...posts];

    // Apply status filter
    if (currentFilter !== "all") {
      filtered = filtered.filter(post => post.status === currentFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      const timeA = a.updatedAt.getTime();
      const timeB = b.updatedAt.getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    setFilteredPosts(filtered);
  }, [posts, currentFilter, searchQuery, sortOrder]);

  const handleEditPost = (postId: string) => {
    setLocation(`/app/post/${postId}`);
  };

  const handleDuplicatePost = async (postId: string) => {
    if (!user) return;

    try {
      const newPostId = await duplicatePost(user.uid, postId);
      toast({
        title: "Post duplicated",
        description: "The post has been duplicated successfully.",
      });
      setLocation(`/app/post/${newPostId}`);
    } catch (error) {
      toast({
        title: "Duplication failed",
        description: "Failed to duplicate the post.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePostFromDb(user.uid, postId);
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the post.",
        variant: "destructive",
      });
    }
  };

  const getPostCounts = () => ({
    all: posts.length,
    draft: posts.filter(p => p.status === "draft").length,
    published: posts.filter(p => p.status === "published").length,
  });

  const getFilterTitle = () => {
    switch (currentFilter) {
      case "draft": return "Draft Posts";
      case "published": return "Published Posts";
      default: return "All Posts";
    }
  };

  if (error) {
    return (
      <AppLayout
        onFilterChange={setCurrentFilter}
        onSearchChange={setSearchQuery}
        postCounts={getPostCounts()}
        currentFilter={currentFilter}
      >
        <div className="flex-1 p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      onFilterChange={setCurrentFilter}
      onSearchChange={setSearchQuery}
      postCounts={getPostCounts()}
      currentFilter={currentFilter}
    >
      <div className="flex-1 p-8" data-testid="post-list">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800" data-testid="text-filter-title">
                {getFilterTitle()}
              </h2>
              <p className="text-slate-600 mt-1" data-testid="text-post-count">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center gap-2"
              data-testid="button-sort"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEditPost}
                  onDuplicate={handleDuplicatePost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12" data-testid="empty-state">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No posts found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery 
                  ? "No posts match your search criteria. Try adjusting your search terms."
                  : currentFilter === "all"
                    ? "You haven't created any posts yet. Click 'New Post' to get started!"
                    : `No ${currentFilter} posts found. Try switching to a different filter.`
                }
              </p>
              {!searchQuery && currentFilter === "all" && (
                <Button onClick={() => setLocation("/app/new")} data-testid="button-create-first-post">
                  Create Your First Post
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
