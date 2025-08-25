import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowUpDown, AlertCircle, PenTool, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import PostCard from "../components/PostCard";
import AppLayout from "./AppLayout";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post, PostStatus } from "../types/post";
import { subscribeToUserPosts, deletePost as deletePostFromDb, duplicatePost, subscribeToUserTags, createPost } from "../lib/posts";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentFilter, setCurrentFilter] = useState<PostStatus | "all">("all");
  const [currentTagFilter, setCurrentTagFilter] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstDraftCompleted, setFirstDraftCompleted] = useState<boolean>(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Subscribe to user posts and tags
  useEffect(() => {
    if (!user) return;

    const unsubscribePosts = subscribeToUserPosts(user.uid, (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    const unsubscribeTags = subscribeToUserTags(user.uid, (userTags) => {
      setAllTags(userTags);
    });

    return () => {
      unsubscribePosts();
      unsubscribeTags();
    };
  }, [user]);

  // Subscribe to user onboarded status
  useEffect(() => {
    if (!user) return;

    const userDoc = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setFirstDraftCompleted(userData.onboarded?.firstDraft ?? true); // Default to true if not set
      }
    });

    return unsubscribeUser;
  }, [user]);

  // Filter and search posts
  useEffect(() => {
    let filtered = [...posts];

    // Apply status filter
    if (currentFilter !== "all") {
      filtered = filtered.filter(post => post.status === currentFilter);
    }

    // Apply tag filter
    if (currentTagFilter) {
      filtered = filtered.filter(post => post.tags.includes(currentTagFilter));
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
  }, [posts, currentFilter, currentTagFilter, searchQuery, sortOrder]);

  const handleEditPost = (postId: string) => {
    setLocation(`/app/post/${postId}`);
  };

  const handleNewPost = async () => {
    if (!user) return;

    try {
      const newPostId = await createPost(user.uid, {
        title: "",
        body: "",
        tags: [],
        status: "draft" as PostStatus,
        scheduledAt: null,
        aiRated: false,
      });
      setLocation(`/app/post/${newPostId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new post.",
        variant: "destructive",
      });
    }
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
        onTagFilterChange={setCurrentTagFilter}
        onSearchChange={setSearchQuery}
        postCounts={getPostCounts()}
        allTags={allTags}
        currentFilter={currentFilter}
        currentTagFilter={currentTagFilter}
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
      onTagFilterChange={setCurrentTagFilter}
      onSearchChange={setSearchQuery}
      postCounts={getPostCounts()}
      allTags={allTags}
      currentFilter={currentFilter}
      currentTagFilter={currentTagFilter}
    >
      <div className="flex-1 p-8" data-testid="post-list">
        <div className="max-w-4xl mx-auto">
          {/* Onboarding Banner */}
          {!firstDraftCompleted && (
            <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white" data-testid="onboarding-banner">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    Welcome to Draftwell! <Sparkles className="w-5 h-5" />
                  </h3>
                  <p className="text-indigo-100 mb-4 leading-relaxed">
                    Ready to create amazing LinkedIn content? Start by writing your first post and discover the power of AI-powered feedback to make every post shine.
                  </p>
                  <Button 
                    onClick={handleNewPost}
                    className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium"
                    data-testid="button-onboarding-create-post"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    Write Your First Post
                  </Button>
                </div>
              </div>
            </div>
          )}


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
                <Button onClick={handleNewPost} data-testid="button-create-first-post">
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
