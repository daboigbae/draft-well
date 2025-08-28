import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Star, 
  Calendar, 
  CalendarX, 
  Upload, 
  Trash2, 
  Maximize2, 
  Minimize2,
  Bot,
  Clock
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post, PostStatus } from "../types/post";
import { getPost, updatePost, deletePost } from "../lib/posts";
import { getRating } from "../lib/rating";
import { useDebounce } from "@/hooks/use-debounce";
import EditorToolbar from "../components/EditorToolbar";
import TagInput from "../components/TagInput";
import CharacterCounter from "../components/CharacterCounter";
import ScheduleModal from "../components/ScheduleModal";
import { renderMarkdown, markdownToLinkedInText } from "../utils/markdown";
import { copyToClipboard } from "../utils/clipboard";
import { exportPostAsText } from "../utils/export";

// LinkedIn Post Preview Component
interface LinkedInPostPreviewProps {
  content: string;
  userName: string;
  userInitial: string;
}

function LinkedInPostPreview({ content, userName, userInitial }: LinkedInPostPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // LinkedIn typically truncates at around 140 characters
  const truncateLength = 140;
  const shouldTruncate = content.length > truncateLength;
  
  // Find a good break point near the truncate length (avoid breaking mid-word)
  const findTruncatePoint = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text.length;
    
    // Look for the last space before maxLength
    let truncatePoint = maxLength;
    for (let i = maxLength; i > maxLength - 30 && i > 0; i--) {
      if (text[i] === ' ' || text[i] === '\n') {
        truncatePoint = i;
        break;
      }
    }
    return truncatePoint;
  };
  
  const truncatePoint = findTruncatePoint(content, truncateLength);
  const truncatedContent = shouldTruncate && !isExpanded 
    ? content.substring(0, truncatePoint)
    : content;

  // Preserve formatting by converting newlines to JSX
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">
            {userInitial}
          </span>
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {userName}
          </div>
          <div className="text-sm text-gray-500">
            Your Title • 1st
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            2m • 🌐
          </div>
        </div>
      </div>

      <div className="text-gray-900 leading-relaxed mb-4">
        {content ? formatContent(truncatedContent) : "Your post content will appear here..."}
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-600 hover:text-gray-800 font-medium ml-1"
          >
            ...more
          </button>
        )}
        {shouldTruncate && isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-600 hover:text-gray-800 font-medium ml-1 block mt-2"
          >
            Show less
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-3">
        👍 You and 24 others
        <span className="float-right">8 comments • 3 reposts</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded">
          👍 Like
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded">
          💬 Comment
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded">
          🔄 Repost
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded">
          ➤ Send
        </button>
      </div>
    </div>
  );
}

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
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [rating, setRating] = useState<{ score: number; feedback: string } | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const debouncedTitle = useDebounce(title, 800);
  const debouncedBody = useDebounce(body, 800);
  const debouncedTags = useDebounce(tags, 800);

  console.log("Rendering Editor, isFullscreen:", isFullscreen);
  
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
          
          // Load rating if exists
          if (postData.rating) {
            setRating({ score: postData.rating, feedback: postData.feedback || "" });
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

  const handleInsertMarkdown = (markdown: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = body.substring(0, start);
    const textAfter = body.substring(end);
    
    const newBody = textBefore + markdown + textAfter;
    setBody(newBody);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + markdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleCopyPost = async () => {
    const linkedInText = markdownToLinkedInText(body);
    const success = await copyToClipboard(linkedInText);
    
    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "Post content has been copied to your clipboard.",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy post to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!post) return;
    exportPostAsText(post, markdownToLinkedInText(body));
    toast({
      title: "Post exported",
      description: "Post has been downloaded as a text file.",
    });
  };

  const handleGetRating = async () => {
    if (!user || !post) return;
    
    const linkedInText = markdownToLinkedInText(body);
    
    if (linkedInText.length < 100 || linkedInText.length > 1000) {
      toast({
        title: "Rating not available",
        description: "Post must be between 100-1000 characters for AI rating.",
        variant: "destructive",
      });
      return;
    }

    setLoadingRating(true);
    try {
      const result = await getRating(user.uid, linkedInText);
      setRating(result);
      
      // Update post with rating
      await updatePost(user.uid, post.id, {
        aiRated: true,
        rating: result.score,
        feedback: result.feedback,
      });
      
      toast({
        title: "Rating received",
        description: `Your post scored ${result.score}/10!`,
      });
    } catch (error: any) {
      toast({
        title: "Rating failed",
        description: error.message || "Failed to get AI rating.",
        variant: "destructive",
      });
    } finally {
      setLoadingRating(false);
    }
  };

  const handleStatusChange = async (status: PostStatus, scheduledAt?: Date) => {
    if (!user || !post) return;

    try {
      await updatePost(user.uid, post.id, {
        status,
        scheduledAt: scheduledAt || null,
      });
      
      setPost(prev => prev ? {
        ...prev,
        status,
        scheduledAt,
      } : null);
      
      toast({
        title: "Status updated",
        description: `Post ${status === 'published' ? 'published' : status === 'scheduled' ? 'scheduled' : 'saved as draft'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update post status.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!user || !post) return;

    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await deletePost(user.uid, post.id);
        toast({
          title: "Post deleted",
          description: "Post has been deleted successfully.",
        });
        setLocation("/app");
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "Failed to delete post.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'scheduled':
        return <Badge className="bg-orange-100 text-orange-800">Scheduled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  const linkedInText = markdownToLinkedInText(body);
  const canGetRating = linkedInText.length >= 100 && linkedInText.length <= 1000;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error || "Post not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isFullscreen) {
    console.log("Rendering fullscreen mode");
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col" data-testid="editor-fullscreen">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              data-testid="button-exit-fullscreen"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Focus Mode
            </Button>
            {saving && <span className="text-sm text-slate-500">Saving...</span>}
            {lastSaved && !saving && (
              <span className="text-sm text-slate-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          <CharacterCounter 
            text={linkedInText} 
            maxLength={3000} 
            warningThreshold={0.87}
            showWordCount={true}
          />
        </div>

        {/* Fullscreen Editor */}
        <div className="flex-1 p-8">
          <Textarea
            ref={bodyRef}
            placeholder="Write your LinkedIn post..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-full w-full border-none p-0 focus-visible:ring-0 shadow-none bg-transparent text-lg leading-relaxed resize-none"
            data-testid="textarea-body-fullscreen"
          />
        </div>
      </div>
    );
  }

  console.log("Rendering normal mode");
  return (
    <div className="min-h-screen bg-white" data-testid="editor">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/app")}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Posts
          </Button>
          
          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-slate-500">Saving...</span>}
            {lastSaved && !saving && (
              <span className="text-sm text-slate-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPost}
            className="flex items-center gap-2"
            data-testid="button-copy"
          >
            <Copy className="w-4 h-4" />
            Copy Post
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
            data-testid="button-export"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGetRating}
            disabled={!canGetRating || loadingRating}
            className="flex items-center gap-2"
            data-testid="button-rating"
          >
            <Star className="w-4 h-4" />
            {loadingRating ? "Getting Rating..." : "Get Rating"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2"
            data-testid="button-schedule"
          >
            <Calendar className="w-4 h-4" />
            Publish / Schedule
          </Button>

          {post.status === 'scheduled' && post.scheduledAt && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('draft')}
              className="flex items-center gap-2"
              data-testid="button-unschedule"
            >
              <CalendarX className="w-4 h-4" />
              Unschedule
            </Button>
          )}

          {post.status === 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('draft')}
              className="flex items-center gap-2"
              data-testid="button-unpublish"
            >
              <Upload className="w-4 h-4" />
              Mark as Published
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2"
            data-testid="button-focus"
          >
            <Maximize2 className="w-4 h-4" />
            Focus Mode
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDeletePost}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            data-testid="button-delete"
          >
            <Trash2 className="w-4 h-4" />
            Delete Post
          </Button>
        </div>

        {/* Status Display */}
        <div className="flex items-center gap-4">
          {getStatusBadge(post.status)}
          {post.status === 'scheduled' && post.scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-orange-700">
              <Clock className="w-4 h-4" />
              Fri, Aug 29 at 12:00 AM
            </div>
          )}
          {rating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              AI Rated
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Editor Panel */}
        <div className="flex-1">
          {/* Title Input */}
          <div className="p-6 border-b border-gray-100">
            <Input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-none p-0 focus-visible:ring-0 shadow-none bg-transparent placeholder-slate-400"
              maxLength={120}
              data-testid="input-title"
            />
            <div className="flex items-center gap-6 text-sm text-slate-500 mt-2">
              <span>{title.length}/120 characters</span>
              <span>{title.trim() ? title.trim().split(/\s+/).length : 0} words</span>
              <span>1 min read</span>
            </div>
          </div>

          {/* Tags */}
          <div className="p-6 border-b border-gray-100">
            <TagInput 
              tags={tags}
              onChange={setTags}
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Editor Toolbar */}
          <EditorToolbar onInsertMarkdown={handleInsertMarkdown} />

          {/* Content Editor */}
          <div className="flex-1 p-6">
            <Textarea
              ref={bodyRef}
              placeholder="Write your LinkedIn post..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-96 w-full border-none p-0 focus-visible:ring-0 shadow-none bg-transparent text-base leading-relaxed resize-none"
              data-testid="textarea-body"
            />
          </div>

          {/* Character Counter */}
          <div className="p-6 border-t border-gray-100">
            <CharacterCounter 
              text={linkedInText} 
              maxLength={3000} 
              warningThreshold={0.87}
              showWordCount={true}
            />
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="w-96 border-l border-gray-200 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Live Preview
              {rating && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <Bot className="w-3 h-3 mr-1" />
                  AI Rated
                </Badge>
              )}
            </h3>

            {/* LinkedIn Post Preview */}
            <LinkedInPostPreview 
              content={linkedInText}
              userName={user?.displayName || 'Your Name'}
              userInitial={user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            />

            {/* AI Rating Display */}
            {rating && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  Post Rating
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-sm font-medium text-amber-700">
                      {rating.score}/10
                    </span>
                  </div>
                </h4>
                
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Feedback</strong>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {rating.feedback || "Conversational and provocative, but it's vague and low on lived detail. It reads like a generic engagement prompt rather than a personal take. No story, stakes, or emotion to anchor it, so it could easily be AI-written even though the topic is timely."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(date) => {
            handleStatusChange('scheduled', date);
            setShowScheduleModal(false);
          }}
          onPublish={() => {
            handleStatusChange('published');
            setShowScheduleModal(false);
          }}
          currentStatus={post.status}
          scheduledDate={post.scheduledAt}
        />
      )}
    </div>
  );
}