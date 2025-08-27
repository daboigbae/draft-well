import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowUpDown, AlertCircle, PenTool, Sparkles, Search, Filter, TrendingUp, Clock, Users, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import PostCard from "../components/PostCard";
import AppLayout from "./AppLayout";
import TutorialModal from "../components/TutorialModal";
import ScheduledPostsView from '../components/ScheduledPostsView';
import SchedulePostModal from '../components/SchedulePostModal';
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post, PostStatus } from "../types/post";
import { subscribeToUserPosts, deletePost as deletePostFromDb, duplicatePost, subscribeToUserTags, createPost, schedulePost } from "../lib/posts";
import { doc, getDoc, onSnapshot, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

// Helper functions for sticky filters
const STORAGE_KEYS = {
  currentFilter: 'draftwell_current_filter',
  currentTagFilter: 'draftwell_current_tag_filter',
  searchQuery: 'draftwell_search_query',
  sortOrder: 'draftwell_sort_order',
  filtersExpanded: 'draftwell_filters_expanded'
};

const loadFromStorage = (key: string, defaultValue: any): any => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail
  }
};

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentFilter, setCurrentFilter] = useState<PostStatus>(() => 
    loadFromStorage(STORAGE_KEYS.currentFilter, "draft")
  );
  const [currentTagFilter, setCurrentTagFilter] = useState<string | null>(() => 
    loadFromStorage(STORAGE_KEYS.currentTagFilter, null)
  );
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(() => 
    loadFromStorage(STORAGE_KEYS.searchQuery, "")
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => 
    loadFromStorage(STORAGE_KEYS.sortOrder, "desc")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstDraftCompleted, setFirstDraftCompleted] = useState<boolean>(true);
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(true);
  const [filtersExpanded, setFiltersExpanded] = useState(() => 
    loadFromStorage(STORAGE_KEYS.filtersExpanded, false)
  );
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | null>(null);
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
        setFirstDraftCompleted(userData.onboarded?.firstDraft ?? false); // Default to false to show onboarding
        setTutorialCompleted(userData.onboarded?.tutorial ?? false); // Default to false to show onboarding
      } else {
        setFirstDraftCompleted(false);
        setTutorialCompleted(false);
      }
    });

    return unsubscribeUser;
  }, [user]);


  // Filter and search posts
  useEffect(() => {
    let filtered = [...posts];

    // Apply status filter
    filtered = filtered.filter(post => post.status === currentFilter);

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
      // If both posts are scheduled, always sort by scheduled date (chronological order)
      if (a.status === "scheduled" && b.status === "scheduled") {
        const timeA = a.scheduledAt ? a.scheduledAt.getTime() : a.updatedAt.getTime();
        const timeB = b.scheduledAt ? b.scheduledAt.getTime() : b.updatedAt.getTime();
        return timeA - timeB; // Always ascending (chronological) for scheduled posts
      }
      
      // For non-scheduled posts, use normal sorting
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

      // Mark first draft as completed
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'onboarded.firstDraft': true
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

  const handleScheduleForDay = (date: Date) => {
    setSelectedScheduleDate(date);
    setScheduleModalOpen(true);
  };

  const handleCreateNewScheduledPost = async () => {
    if (!user || !selectedScheduleDate) return;

    try {
      console.log('Creating scheduled post for date:', selectedScheduleDate);
      
      // Create new post with scheduled status and date
      const newPostId = await createPost(user.uid, {
        title: "",
        body: "",
        tags: [],
        status: "scheduled",
        scheduledAt: Timestamp.fromDate(selectedScheduleDate),
        aiRated: false,
      });
      
      console.log('Post created successfully with ID:', newPostId);
      
      toast({
        title: "New post created",
        description: `Post scheduled for ${selectedScheduleDate.toLocaleDateString()}`,
      });
      
      // Navigate to editor for the new post
      setLocation(`/app/post/${newPostId}`);
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      toast({
        title: "Creation failed",
        description: `Failed to create the scheduled post: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleScheduleExistingDraft = async (postId: string) => {
    if (!user || !selectedScheduleDate) return;

    try {
      await schedulePost(user.uid, postId, selectedScheduleDate);
      
      toast({
        title: "Post scheduled",
        description: `Post scheduled for ${selectedScheduleDate.toLocaleDateString()}`,
      });
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: "Failed to schedule the post.",
        variant: "destructive",
      });
    }
  };

  const getPostCounts = () => ({
    draft: posts.filter(p => p.status === "draft").length,
    published: posts.filter(p => p.status === "published").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
  });

  const getFilterTitle = () => {
    switch (currentFilter) {
      case "draft": return "Draft Posts";
      case "published": return "Published Posts";
      case "scheduled": return "Scheduled Posts";
      default: return "Draft Posts";
    }
  };

  const updateCurrentFilter = (filter: PostStatus) => {
    setCurrentFilter(filter);
    saveToStorage(STORAGE_KEYS.currentFilter, filter);
  };

  const updateCurrentTagFilter = (tagFilter: string | null) => {
    setCurrentTagFilter(tagFilter);
    saveToStorage(STORAGE_KEYS.currentTagFilter, tagFilter);
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    saveToStorage(STORAGE_KEYS.searchQuery, query);
  };

  const updateSortOrder = (order: "asc" | "desc") => {
    setSortOrder(order);
    saveToStorage(STORAGE_KEYS.sortOrder, order);
  };

  const updateFiltersExpanded = (expanded: boolean) => {
    setFiltersExpanded(expanded);
    saveToStorage(STORAGE_KEYS.filtersExpanded, expanded);
  };

  if (error) {
    return (
      <AppLayout>
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
    <AppLayout>
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen" data-testid="post-list">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">


          {/* Header with Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8 mb-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-indigo-600 bg-clip-text text-transparent mb-2" data-testid="text-filter-title">
                    {getFilterTitle()}
                  </h1>
                  <p className="text-slate-600 text-lg" data-testid="text-post-count">
                    {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{getPostCounts().draft}</div>
                    <div className="text-xs text-slate-500 font-medium">Drafts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{getPostCounts().published}</div>
                    <div className="text-xs text-slate-500 font-medium">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{getPostCounts().scheduled}</div>
                    <div className="text-xs text-slate-500 font-medium">Scheduled</div>
                  </div>
                </div>
              </div>
              
              {/* Post Status Filters - Always Visible */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant={currentFilter === "draft" ? "default" : "outline"}
                  onClick={() => updateCurrentFilter("draft")}
                  className={`flex flex-col items-center gap-2 h-auto py-4 px-3 transition-all ${
                    currentFilter === "draft" 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg" 
                      : "hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  data-testid="button-filter-draft"
                >
                  <PenTool className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Drafts</div>
                    <div className={`text-xs ${currentFilter === "draft" ? "text-blue-100" : "text-slate-500"}`}>
                      {getPostCounts().draft} drafts
                    </div>
                  </div>
                </Button>
                <Button
                  variant={currentFilter === "scheduled" ? "default" : "outline"}
                  onClick={() => updateCurrentFilter("scheduled")}
                  className={`flex flex-col items-center gap-2 h-auto py-4 px-3 transition-all ${
                    currentFilter === "scheduled" 
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg" 
                      : "hover:border-orange-300 hover:bg-orange-50"
                  }`}
                  data-testid="button-filter-scheduled"
                >
                  <Clock className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Scheduled</div>
                    <div className={`text-xs ${currentFilter === "scheduled" ? "text-orange-100" : "text-slate-500"}`}>
                      {getPostCounts().scheduled} pending
                    </div>
                  </div>
                </Button>
                <Button
                  variant={currentFilter === "published" ? "default" : "outline"}
                  onClick={() => updateCurrentFilter("published")}
                  className={`flex flex-col items-center gap-2 h-auto py-4 px-3 transition-all ${
                    currentFilter === "published" 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg" 
                      : "hover:border-green-300 hover:bg-green-50"
                  }`}
                  data-testid="button-filter-published"
                >
                  <Users className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Published</div>
                    <div className={`text-xs ${currentFilter === "published" ? "text-green-100" : "text-slate-500"}`}>
                      {getPostCounts().published} live
                    </div>
                  </div>
                </Button>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by title, content, or tags..."
                  className="pl-12 pr-4 py-3 text-base border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="text-slate-500 hover:text-slate-700"
                    data-testid="button-sort"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-slate-500" />
                <span className="text-lg font-semibold text-slate-700">Filter by Tag</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={currentTagFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateCurrentTagFilter(null)}
                  className={`transition-all ${
                    currentTagFilter === null 
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white" 
                      : "hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  data-testid="button-tag-all"
                >
                  All Tags
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={currentTagFilter === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateCurrentTagFilter(tag)}
                    className={`transition-all ${
                      currentTagFilter === tag 
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white" 
                        : "hover:border-violet-300 hover:bg-violet-50"
                    }`}
                    data-testid={`button-tag-${tag}`}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                      </div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-12"></div>
                    </div>
                    <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                        ))}
                      </div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            currentFilter === "scheduled" ? (
              <ScheduledPostsView 
                posts={filteredPosts} 
                allPosts={posts}
                onEdit={handleEditPost}
                onDuplicate={handleDuplicatePost}
                onDelete={handleDeletePost}
                onScheduleForDay={handleScheduleForDay}
              />
            ) : (
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
            )
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
              ) : currentFilter === "draft" ? (
                firstDraftCompleted ? (
                  <div className="text-center">
                    <div className="text-slate-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Ready to write?</h3>
                    <p className="text-slate-600 mb-6">
                      You haven't created any posts yet. Start writing your next LinkedIn post.
                    </p>
                    <Button onClick={handleNewPost} data-testid="button-create-first-post">
                      <PenTool className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </div>
                ) : (
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
                        <p className="mb-3">I've shipped millions of lines of code.</p>
                        <p className="mb-3">I've led teams. I've mentored engineers.</p>
                        <p className="mb-3">Yet you want to see me stumble through a "reverse a linked list" problem on a whiteboard?</p>
                        <p className="mb-3">Here's what you should evaluate instead:</p>
                        <ul className="list-disc list-inside mb-3 space-y-1">
                          <li>Can they explain complex technical concepts clearly?</li>
                          <li>Do they ask the right questions about requirements?</li>
                          <li>Can they reason about trade-offs and system design?</li>
                          <li>How do they handle ambiguous problems?</li>
                        </ul>
                        <p className="mb-3">These skills matter infinitely more than whether someone can balance a binary tree in 20 minutes while you watch.</p>
                        <p className="mb-3">Trust me - the engineer who can explain why they chose React over Vue for your specific use case is worth 10x more than someone who memorized sorting algorithms.</p>
                        <p className="text-slate-600 italic">What's your take? Are technical interviews broken?</p>
                      </div>
                      
                      <div className="text-slate-600 text-sm">
                        <div className="flex items-center gap-4 mb-3">
                          <span>👍 125 • 💬 42 • 🔄 18</span>
                        </div>
                        <div className="text-xs text-slate-400">2 hours ago</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border border-indigo-100">
                      <h4 className="font-medium text-slate-800 mb-2">🚀 Ready to share your expertise?</h4>
                      <p className="text-slate-600 text-sm mb-4">
                        Your unique perspective could be the next post that goes viral. Share your experiences, insights, and knowledge with your professional network.
                      </p>
                      <Button onClick={handleNewPost} className="w-full sm:w-auto" data-testid="button-new-post-cta">
                        <PenTool className="w-4 h-4 mr-2" />
                        Start Writing
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <div className="text-slate-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No {currentFilter} posts yet</h3>
                  <p className="text-slate-600 mb-6">
                    You haven't created any {currentFilter} posts yet. Start writing and organize your content.
                  </p>
                  <Button onClick={handleNewPost} data-testid="button-create-first-post">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tutorial Modal */}
        {user && (
          <TutorialModal
            open={!tutorialCompleted}
            onComplete={() => setTutorialCompleted(true)}
          />
        )}

        <SchedulePostModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          targetDate={selectedScheduleDate}
          draftPosts={posts.filter(post => post.status === "draft")}
          onSelectDraft={handleScheduleExistingDraft}
          onCreateNew={handleCreateNewScheduledPost}
        />
      </div>
    </AppLayout>
  );
}