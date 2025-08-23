import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Copy, Download, Share, Calendar, Save, Bot, Hash } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import EditorToolbar from "../components/EditorToolbar";
import TagInput from "../components/TagInput";
import CharacterCounter from "../components/CharacterCounter";
import HashtagCollectionManager from "../components/HashtagCollectionManager";
import ScheduleModal from "../components/ScheduleModal";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post } from "../types/post";
import { getPost, updatePost, publishPost } from "../lib/posts";
import { renderMarkdown } from "../utils/markdown";
import { copyToClipboard } from "@/utils/clipboard";
import { exportPostAsText } from "@/utils/export";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [aiVetted, setAiVetted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [showHashtagManager, setShowHashtagManager] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const debouncedTitle = useDebounce(title, 800);
  const debouncedBody = useDebounce(body, 800);
  const debouncedTags = useDebounce(tags, 800);
  const debouncedAiVetted = useDebounce(aiVetted, 800);

  // Reset preview to collapsed when body changes
  useEffect(() => {
    setPreviewExpanded(false);
  }, [body]);

  const handleInsertHashtags = (hashtags: string[]) => {
    const hashtagText = hashtags.join(' ');
    const currentCursor = bodyRef.current?.selectionStart || body.length;
    const newBody = body.slice(0, currentCursor) + ' ' + hashtagText + body.slice(currentCursor);
    setBody(newBody);
    
    // Focus back on the textarea and position cursor after inserted hashtags
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
        bodyRef.current.setSelectionRange(
          currentCursor + hashtagText.length + 1,
          currentCursor + hashtagText.length + 1
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
          setAiVetted(postData.aiVetted);
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
      JSON.stringify(debouncedTags) !== JSON.stringify(post.tags) ||
      debouncedAiVetted !== post.aiVetted;

    if (hasChanges) {
      savePost();
    }
  }, [debouncedTitle, debouncedBody, debouncedTags, debouncedAiVetted]);

  const savePost = async () => {
    if (!user || !post || saving) return;

    setSaving(true);
    try {
      await updatePost(user.uid, post.id, {
        title,
        body,
        tags,
        aiVetted,
      });
      setLastSaved(new Date());
      
      // Update local post state
      setPost(prev => prev ? {
        ...prev,
        title,
        body,
        tags,
        aiVetted,
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
      await copyToClipboard(body);
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
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/app")}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500" data-testid="save-status">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Save className="h-4 w-4 text-green-600" />
                  <span>Saved • {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              ) : null}
            </div>
            
            <Button variant="outline" onClick={handleCopy} data-testid="button-copy">
              <Copy className="h-4 w-4 mr-2" />
              Copy Post
            </Button>
            
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export .txt
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowPublishModal(true)}
              data-testid="button-open-publish-modal"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mark as Published
            </Button>
            
            <Button onClick={handlePublish} data-testid="button-publish">
              <Share className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
        
        {/* Title Input */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Enter post title (max 120 characters)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyboardShortcuts}
            className="text-2xl font-bold border-none p-0 focus-visible:ring-0"
            maxLength={120}
            data-testid="input-title"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-slate-500" data-testid="title-char-count">
              {title.length}/120 characters
            </span>
            <div className="flex items-center gap-4 text-sm text-slate-500">
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
        
        {/* AI Vetting Checkbox and Hashtag Manager */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ai-vetted"
              checked={aiVetted}
              onCheckedChange={(checked) => setAiVetted(checked === true)}
              data-testid="checkbox-ai-vetted"
            />
            <Label htmlFor="ai-vetted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Vetted by AI
            </Label>
          </div>
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
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <EditorToolbar onInsertMarkdown={handleInsertMarkdown} />
          
          <div className="flex-1 flex flex-col">
            <Textarea
              ref={bodyRef}
              placeholder="Start writing your LinkedIn post..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyboardShortcuts}
              className="flex-1 border-none resize-none font-mono text-sm leading-relaxed focus-visible:ring-0"
              data-testid="textarea-body"
            />
            
            <div className="bg-white border-t border-gray-200 p-4">
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
        
        {/* Preview Panel */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4">
            <h3 className="font-semibold text-slate-700">Live Preview</h3>
          </div>
          
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
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <ScheduleModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublishFromModal}
      />
    </div>
  );
}
