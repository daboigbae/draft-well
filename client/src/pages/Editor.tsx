import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Post } from "../types/post";
import { getPost, updatePost } from "../lib/posts";
import { useDebounce } from "@/hooks/use-debounce";

export default function Editor() {
  const params = useParams();
  const postId = params.id;
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

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const debouncedTitle = useDebounce(title, 800);
  const debouncedBody = useDebounce(body, 800);
  const debouncedTags = useDebounce(tags, 800);

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

  const handleKeyboardShortcuts = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "s") {
      event.preventDefault();
      savePost();
    }
  };

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

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="editor">
      {/* Title Input */}
      <div className="p-6 border-b border-gray-100">
        <Input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyboardShortcuts}
          className="text-3xl font-bold border-none p-0 focus-visible:ring-0 shadow-none bg-transparent"
          maxLength={120}
          data-testid="input-title"
        />
      </div>

      {/* Main Editor - Full Screen */}
      <div className="flex-1 p-6">
        <Textarea
          ref={bodyRef}
          placeholder="Write your LinkedIn post..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyboardShortcuts}
          className="min-h-full w-full border-none p-0 focus-visible:ring-0 shadow-none bg-transparent text-lg leading-relaxed resize-none"
          data-testid="textarea-body"
        />
      </div>
    </div>
  );
}