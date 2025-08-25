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
              {searchQuery ? (
                <>
                  <div className="text-slate-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No posts found</h3>
                  <p className="text-slate-600 mb-6">
                    No posts match your search criteria. Try adjusting your search terms.
                  </p>
                </>
              ) : currentFilter === "all" ? (
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Your next viral post starts here</h3>
                  <p className="text-slate-600 mb-8">
                    Imagine sharing insights that spark conversations, build your network, and establish your expertise. Here's what your post could look like:
                  </p>
                  
                  {/* Example Post Preview */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src="https://media.licdn.com/dms/image/v2/D5603AQGeotNHHd8VhQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1723385389068?e=1758758400&v=beta&t=U7d-58A04Mhu8VyxHDNOIrA-j21HghJwsB0GR4oGUz0"
                        alt="Gabe's profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-slate-800">Gabe</div>
                        <div className="text-sm text-slate-500">Senior Developer & Top 1% Freelancer</div>
                      </div>
                    </div>
                    
                    <div className="text-slate-800 leading-relaxed mb-4">
                      <p className="mb-3">I declined a job this week because they wanted me to do some live coding during the interview.</p>
                      <p className="mb-3">Look, I get it. Hiring devs is hella hard.</p>
                      <p className="mb-3">But if your hiring process still involves making senior engineers do LeetCode under pressure.</p>
                      <p className="mb-3"><strong>You're not hiring. You're hazing.</strong></p>
                      <p className="mb-3">I've been writing code for almost a decade.</p>
                      <p className="mb-3">I've shipped real apps, saved dying projects, and built a business off my results.</p>
                      <p className="mb-3">I'm a top 1% freelancer on UpWork with almost 10,000 hours billed and over $700k earned.</p>
                      <p className="mb-3">You can Google me. My resume is public.</p>
                      <p className="mb-3">If that's not enough proof that I know what I'm doing.</p>
                      <p className="mb-3"><strong>You're not the kind of client I want to work with.</strong></p>
                      <p className="mb-3 italic">= = = gabe was here = =</p>
                      <p className="mb-3">Sorry not sorry.</p>
                      <p className="mb-3">What do y'all think? Are live coding interviews still legit in 2025 — or are they just lazy vetting?</p>
                      <p className="mt-3 text-indigo-600">#freelancing #programming #innovation #artificialintelligence #ai</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-500 pt-3 border-t border-gray-100">
                      <span>💬 284 comments</span>
                      <span>🔄 156 shares</span>
                      <span>❤️ 3.7K reactions</span>
                    </div>
                  </div>
                  
                  <div className="text-slate-600 mb-6">
                    <strong>Your story matters.</strong> Share your unique perspective, lessons learned, and insights that only you can provide. 
                    The LinkedIn community is waiting to hear from you.
                  </div>
                  
                  <Button 
                    onClick={handleNewPost} 
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8"
                    data-testid="button-create-first-post"
                  >
                    <PenTool className="w-5 h-5 mr-2" />
                    Start Writing Your Story
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-slate-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No posts found</h3>
                  <p className="text-slate-600 mb-6">
                    No {currentFilter} posts found. Try switching to a different filter.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
