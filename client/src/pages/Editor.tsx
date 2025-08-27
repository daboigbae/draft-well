import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Copy, Download, Share, Calendar, Save, Bot, Hash, Star, Trash2, CalendarX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import EditorToolbar from "../components/EditorToolbar";
import TagInput from "../components/TagInput";
import CharacterCounter from "../components/CharacterCounter";
import HashtagCollectionManager from "../components/HashtagCollectionManager";
import ScheduleModal from "../components/ScheduleModal";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post } from "../types/post";
import { getPost, updatePost, publishPost, schedulePost, unschedulePost, deletePost } from "../lib/posts";
import { renderMarkdown, markdownToLinkedInText } from "../utils/markdown";
import { copyToClipboard } from "@/utils/clipboard";
import { exportPostAsText } from "@/utils/export";
import { useDebounce } from "@/hooks/use-debounce";
import { getRating, RatingResponse, RatingData } from "../lib/rating";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Editor() {
  const params = useParams();
  const postId = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [showHashtagManager, setShowHashtagManager] = useState(false);
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [showRatingConfirmDialog, setShowRatingConfirmDialog] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [firstRatingCompleted, setFirstRatingCompleted] = useState<boolean>(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Computed based on whether rating exists - backend handles aiRated flag
  const aiRated = !!rating;

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const debouncedTitle = useDebounce(title, 800);
  const debouncedBody = useDebounce(body, 800);
  const debouncedTags = useDebounce(tags, 800);

  // Reset preview to collapsed when body changes
  useEffect(() => {
    setPreviewExpanded(false);
  }, [body]);

  const handleInsertHashtags = (hashtags: string[]) => {
    const hashtagText = hashtags.join(' ');
    const currentCursor = bodyRef.current?.selectionStart || body.length;
    
    const newBody = body.slice(0, currentCursor) + hashtagText + body.slice(currentCursor);
    setBody(newBody);
    
    // Focus back on the textarea and position cursor after inserted hashtags
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
        bodyRef.current.setSelectionRange(
          currentCursor + hashtagText.length,
          currentCursor + hashtagText.length
        );
      }
    }, 0);
  };

  // Load post
  useEffect(() => {
    if (!user || !postId) return;

    const loadPost = async () => {
      try {
        const postData = await getPost(user.uid, postId);
        if (postData) {
          setPost(postData);
          setTitle(postData.title);
          setBody(postData.body);
          setTags(postData.tags);
          // aiRated is computed from rating existence
          
          // Load existing rating and feedback if available
          if (postData.rating && postData.feedback) {
            setRating({
              rating: postData.rating,
              feedback: postData.feedback
            });
          }
        } else {
          setError("Post not found");
        }
      } catch (error) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [user, postId]);

  // Listen to user onboarding state for firstRating
  useEffect(() => {
    if (!user) return;

    const userDoc = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setFirstRatingCompleted(userData.onboarded?.firstRating ?? false); // Default to false to show onboarding
      } else {
        setFirstRatingCompleted(false);
      }
    });

    return unsubscribeUser;
  }, [user]);


  // Auto-save
  useEffect(() => {
    if (!user || !post || loading) return;

    const hasChanges = 
      debouncedTitle !== post.title ||
      debouncedBody !== post.body ||
      JSON.stringify(debouncedTags) !== JSON.stringify(post.tags);

    if (hasChanges) {
      savePost();
    }
  }, [debouncedTitle, debouncedBody, debouncedTags]);

  const savePost = async () => {
    if (!user || !post || saving) return;

    setSaving(true);
    try {
      await updatePost(user.uid, post.id, {
        title,
        body,
        tags,
      });
      setLastSaved(new Date());
      
      // Update local post state
      setPost(prev => prev ? {
        ...prev,
        title,
        body,
        tags,
        updatedAt: new Date(),
      } : null);
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save your changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyboardShortcuts = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "s") {
      event.preventDefault();
      savePost();
    }
  };

  const handleInsertMarkdown = (markdown: string) => {
    if (!bodyRef.current) return;

    const textarea = bodyRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.substring(0, start) + markdown + text.substring(end);
    setBody(newText);
    
    // Focus and set cursor position
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 0);
  };

  const handleCopy = async () => {
    try {
      const linkedInText = markdownToLinkedInText(body);
      await copyToClipboard(linkedInText);
      toast({
        title: "Copied to clipboard",
        description: "Post content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy post content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!post) return;
    
    try {
      exportPostAsText({ ...post, title, body, tags });
      toast({
        title: "Post exported",
        description: "Post has been exported as a .txt file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export post as text file.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    if (!user || !post) return;

    try {
      await publishPost(user.uid, post.id);
      setPost(prev => prev ? { ...prev, status: "published" } : null);
      toast({
        title: "Post published",
        description: "Your post has been marked as published.",
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description: "Failed to publish post.",
        variant: "destructive",
      });
    }
  };

  const handlePublishFromModal = async () => {
    if (!user || !post) return;

    try {
      await publishPost(user.uid, post.id);
      setPost(prev => prev ? { ...prev, status: "published", scheduledAt: null } : null);
      toast({
        title: "Post published",
        description: "Your post has been marked as published.",
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description: "Failed to publish post.",
        variant: "destructive",
      });
    }
  };

  const handleSchedule = async (scheduledDate: Date) => {
    if (!user || !post) return;

    try {
      await schedulePost(user.uid, post.id, scheduledDate);
      setPost(prev => prev ? { ...prev, status: "scheduled", scheduledAt: scheduledDate } : null);
      toast({
        title: "Post scheduled",
        description: `Your post has been scheduled for ${scheduledDate.toLocaleString()}.`,
      });
    } catch (error) {
      toast({
        title: "Schedule failed",
        description: "Failed to schedule post.",
        variant: "destructive",
      });
    }
  };

  const handleUnschedule = async () => {
    if (!user || !post) return;

    try {
      await unschedulePost(user.uid, post.id);
      setPost(prev => prev ? { ...prev, status: "draft", scheduledAt: null } : null);
      toast({
        title: "Post unscheduled",
        description: "Your post has been converted back to a draft.",
      });
    } catch (error) {
      toast({
        title: "Unschedule failed",
        description: "Failed to unschedule post.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !post) return;

    try {
      await deletePost(user.uid, post.id);
      toast({
        title: "Post deleted",
        description: "Your post has been permanently deleted.",
      });
      setLocation("/app");
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  };

  const handleGetRating = async () => {
    if (!body.trim() || loadingRating) return;

    // Check if post already has a rating and ask for confirmation
    if (rating) {
      setShowRatingConfirmDialog(true);
      return;
    }

    await performRating();
  };

  const performRating = async () => {
    const trimmedBody = body.trim();
    const charCount = trimmedBody.length;

    // Check for posts that are too short
    if (charCount < 100) {
      toast({
        title: "Post too short",
        description: "Posts under 100 characters are too short for LinkedIn best practices. Consider adding more value and context.",
        variant: "destructive",
      });
      return;
    }

    // Check for posts that are too long
    if (charCount > 1000) {
      toast({
        title: "Post too long",
        description: "Posts over 1000 characters may lose reader engagement. Consider breaking into shorter, more digestible content.",
        variant: "destructive",
      });
      return;
    }

    setLoadingRating(true);
    try {
      const ratingResult = await getRating(body, postId!, user!.uid);
      
      if (ratingResult.success && ratingResult.data) {
        setRating(ratingResult.data);
        // aiRated is automatically computed from rating existence
        
        // Mark first rating as completed if this is their first rating
        if (!firstRatingCompleted) {
          try {
            const userDocRef = doc(db, 'users', user!.uid);
            await updateDoc(userDocRef, {
              'onboarded.firstRating': true
            });
          } catch (error) {
            console.error('Error updating firstRating status:', error);
          }
        }
        
        toast({
          title: "Rating received",
          description: `Your post received a rating of ${ratingResult.data.rating}/10`,
        });
      } else {
        toast({
          title: "Rating failed",
          description: ratingResult.error || "Failed to get rating for your post.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Rating error:', error);
      toast({
        title: "Rating failed",
        description: "Failed to get rating for your post.",
        variant: "destructive",
      });
    } finally {
      setLoadingRating(false);
    }
  };

  const handleConfirmRating = () => {
    setShowRatingConfirmDialog(false);
    performRating();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error || "Post not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // LinkedIn-style preview logic
  const PREVIEW_CHAR_LIMIT = 110;
  const shouldShowMore = body.length > PREVIEW_CHAR_LIMIT;
  const previewText = previewExpanded || !shouldShowMore 
    ? body 
    : body.substring(0, PREVIEW_CHAR_LIMIT);
  
  const renderedMarkdown = renderMarkdown(previewText);

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="editor">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
        {/* First row: Back button and save status */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/app")}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Posts</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500" data-testid="save-status">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline">Saved • {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="sm:hidden">Saved</span>
              </>
            ) : null}
          </div>
        </div>
        
        {/* Action buttons - responsive layout */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button 
            variant="outline" 
            onClick={handleCopy} 
            size="sm"
            className="text-xs sm:text-sm"
            data-testid="button-copy"
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Copy Post</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExport} 
            size="sm"
            className="text-xs sm:text-sm"
            data-testid="button-export"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Export</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGetRating}
            disabled={!body.trim() || loadingRating}
            size="sm"
            className="text-xs sm:text-sm"
            data-testid="button-get-rating"
          >
            {loadingRating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary"></div>
                <span className="hidden sm:inline ml-2">Getting Rating...</span>
              </>
            ) : (
              <>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Get Rating</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowPublishModal(true)}
            size="sm"
            className="text-xs sm:text-sm"
            data-testid="button-open-publish-modal"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Publish / Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
          
          {post?.status === "scheduled" && (
            <Button
              variant="outline"
              onClick={handleUnschedule}
              size="sm"
              className="text-xs sm:text-sm text-orange-600 border-orange-300 hover:bg-orange-50"
              data-testid="button-unschedule"
            >
              <CalendarX className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline ml-2">Unschedule</span>
              <span className="sm:hidden">Unschedule</span>
            </Button>
          )}
          
          <Button 
            onClick={handlePublish} 
            size="sm"
            className="text-xs sm:text-sm"
            data-testid="button-publish"
          >
            <Share className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Mark as Published</span>
            <span className="sm:hidden">Publish</span>
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            size="sm"
            className="text-xs sm:text-sm"
            data-testid="button-delete"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Delete Post</span>
            <span className="sm:hidden">Delete</span>
          </Button>
          
          {/* Mobile Preview Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            size="sm"
            className="lg:hidden text-xs"
            data-testid="button-toggle-mobile-preview"
          >
            <div className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2">
              {showMobilePreview ? '👁️' : '👁️'}
            </div>
            <span className="ml-2">{showMobilePreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>
        </div>
        
        {/* Post Status Information */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge 
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              post.status === "draft" ? "bg-blue-100 text-blue-700" :
              post.status === "published" ? "bg-green-100 text-green-700" :
              post.status === "scheduled" ? "bg-orange-100 text-orange-700" : ""
            }`} 
            data-testid="badge-post-status"
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
          
          {post.status === "scheduled" && post.scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 rounded-full border border-orange-200" data-testid="scheduled-info">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {post.scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {post.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
          )}
          
          {aiRated && rating && (
            <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700" data-testid="badge-ai-rated">
              <Star className="w-3 h-3 mr-1" />
              AI Rated: {rating.rating}/10
            </Badge>
          )}
        </div>
        
        {/* Title Input */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Enter post title (max 120 characters)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyboardShortcuts}
            className="text-xl sm:text-2xl font-bold border-none p-0 focus-visible:ring-0"
            maxLength={120}
            data-testid="input-title"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
            <span className="text-xs sm:text-sm text-slate-500" data-testid="title-char-count">
              {title.length}/120 characters
            </span>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
              <span data-testid="word-count">
                {body.trim() ? body.trim().split(/\s+/).length : 0} words
              </span>
              <span data-testid="read-time">
                {Math.max(1, Math.ceil((body.trim() ? body.trim().split(/\s+/).length : 0) / 200))} min read
              </span>
            </div>
          </div>
        </div>
        
        {/* Tags Input */}
        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="Enter tags separated by commas"
        />
        
        {/* Hashtag Manager */}
        <div className="flex items-center justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowHashtagManager(!showHashtagManager)}
            data-testid="button-toggle-hashtag-manager"
          >
            <Hash className="w-4 h-4 mr-2" />
            {showHashtagManager ? 'Hide' : 'Show'} Hashtag Collections
          </Button>
        </div>

        {showHashtagManager && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <HashtagCollectionManager
              onSelectCollection={handleInsertHashtags}
              showInsertButtons={true}
            />
          </div>
        )}

        {/* First Rating Encouragement Banner */}
        {!firstRatingCompleted && body.trim().length >= 100 && body.trim().length <= 1000 && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4" data-testid="first-rating-encouragement">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">
                  Ready to discover your post's potential?
                </h3>
                <p className="text-purple-700 text-sm mb-3">
                  Get your first AI-powered rating and unlock personalized suggestions to make your LinkedIn posts more engaging. Your content looks great – let's see how it scores!
                </p>
                <Button
                  onClick={handleGetRating}
                  disabled={loadingRating}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                  data-testid="button-first-rating-cta"
                >
                  {loadingRating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Getting your first rating...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Get Your First Rating
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col lg:border-r border-gray-200">
          <EditorToolbar onInsertMarkdown={handleInsertMarkdown} />
          
          <div className="flex-1 flex flex-col">
            <Textarea
              ref={bodyRef}
              placeholder="Start writing your LinkedIn post..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyboardShortcuts}
              className="flex-1 border-none resize-none font-mono text-sm leading-relaxed focus-visible:ring-0 min-h-[300px] lg:min-h-0"
              data-testid="textarea-body"
            />
            
            <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
              <CharacterCounter
                text={body}
                maxLength={3000}
                warningThreshold={2600 / 3000}
                showProgressBar={true}
                showWordCount={true}
              />
            </div>
          </div>
        </div>
        
        {/* Mobile Preview Panel - Toggleable */}
        {showMobilePreview && (
          <div className="lg:hidden bg-gray-50 border-t border-gray-200">
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 text-sm">Live Preview</h3>
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="text-slate-500 hover:text-slate-700"
                data-testid="button-close-mobile-preview"
              >
                ✕
              </button>
            </div>
            
            {/* Rating Display */}
            {rating && (
              <div className="bg-white border-b border-gray-200 p-3" data-testid="rating-display-mobile">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-700 text-sm">Post Rating</h4>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-slate-800" data-testid="rating-score-mobile">
                      {rating.rating}/10
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm" data-testid="preview-panel-mobile">
                <div className="p-3">
                  {/* Mock LinkedIn Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{user?.email?.split('@')[0] || 'Your Name'}</div>
                      <div className="text-xs text-slate-500">Your Title • 1st</div>
                      <div className="text-xs text-slate-400">2m • 🌍</div>
                    </div>
                  </div>
                  
                  {/* Post Content Preview */}
                  <div className="prose max-w-none prose-slate prose-sm" data-testid="markdown-preview-mobile">
                    <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                    {shouldShowMore && !previewExpanded && (
                      <button
                        onClick={() => setPreviewExpanded(true)}
                        className="text-slate-500 hover:text-slate-700 font-medium text-sm mt-1 cursor-pointer"
                        data-testid="button-show-more-mobile"
                      >
                        ...more
                      </button>
                    )}
                    {shouldShowMore && previewExpanded && (
                      <button
                        onClick={() => setPreviewExpanded(false)}
                        className="text-slate-500 hover:text-slate-700 font-medium text-sm mt-2 cursor-pointer"
                        data-testid="button-show-less-mobile"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop Preview Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col">
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Live Preview</h3>
              {aiRated && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1" data-testid="ai-rated-badge">
                  <Bot className="h-3 w-3" />
                  AI Rated
                </span>
              )}
            </div>
          </div>
          
          {/* Rating Display */}
          {rating && (
            <div className="bg-white border-b border-gray-200 p-4" data-testid="rating-display">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-700">Post Rating</h4>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-bold text-slate-800" data-testid="rating-score">
                    {rating.rating}/10
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm" data-testid="preview-panel">
              <div className="p-4">
                {/* Mock LinkedIn Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-slate-800">{user?.email?.split('@')[0] || 'Your Name'}</div>
                    <div className="text-sm text-slate-500">Your Title • 1st</div>
                    <div className="text-xs text-slate-400">2m • 🌍</div>
                  </div>
                </div>
                
                {/* Post Content Preview */}
                <div className="prose max-w-none prose-slate" data-testid="markdown-preview">
                  <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                  {shouldShowMore && !previewExpanded && (
                    <button
                      onClick={() => setPreviewExpanded(true)}
                      className="text-slate-500 hover:text-slate-700 font-medium text-sm mt-1 cursor-pointer"
                      data-testid="button-show-more"
                    >
                      ...more
                    </button>
                  )}
                  {shouldShowMore && previewExpanded && (
                    <button
                      onClick={() => setPreviewExpanded(false)}
                      className="text-slate-500 hover:text-slate-700 font-medium text-sm mt-2 cursor-pointer"
                      data-testid="button-show-less"
                    >
                      Show less
                    </button>
                  )}
                </div>
                
                {/* Mock LinkedIn Actions */}
                <div className="border-t border-gray-100 mt-4 pt-3">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <span>👍 You and 24 others</span>
                    <span>8 comments • 3 reposts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded">
                      👍 Like
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded">
                      💬 Comment
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded">
                      🔄 Repost
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded">
                      📨 Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rating Suggestions */}
            {rating && rating.feedback && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-6" data-testid="rating-feedback-panel">
                <div className="p-4">
                  <h4 className="font-medium text-slate-700 mb-4">Feedback</h4>
                  <div className="text-sm text-slate-600 leading-relaxed" data-testid="rating-feedback">
                    {rating.feedback}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <ScheduleModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublishFromModal}
        onSchedule={handleSchedule}
        currentScheduledAt={post?.scheduledAt}
      />

      {/* Rating Confirmation Dialog */}
      <AlertDialog open={showRatingConfirmDialog} onOpenChange={setShowRatingConfirmDialog}>
        <AlertDialogContent data-testid="rating-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Re-rate this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This post already has a rating of <strong>{rating?.rating}/10</strong>. 
              Are you sure you want to rate it again? This will replace the existing rating and suggestions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-rating">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRating} data-testid="button-confirm-rating">
              Yes, rate again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="delete-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              data-testid="button-confirm-delete"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
