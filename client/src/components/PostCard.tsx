import { formatDistanceToNow } from "date-fns";
import { Copy, CopyCheck, Download, Trash2, Edit, Clock, Bot, Star } from "lucide-react";
import { Post } from "../types/post";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useToast } from "../hooks/use-toast";
import { copyToClipboard } from "@/utils/clipboard";
import { exportPostAsText } from "@/utils/export";
import { markdownToLinkedInText } from "@/utils/markdown";

interface PostCardProps {
  post: Post;
  onEdit: (postId: string) => void;
  onDuplicate: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export default function PostCard({ post, onEdit, onDuplicate, onDelete }: PostCardProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const linkedInText = markdownToLinkedInText(post.body);
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
    try {
      exportPostAsText(post);
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow" data-testid={`card-post-${post.id}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-800" data-testid={`text-title-${post.id}`}>
                {post.title.length > 42 ? post.title.substring(0, 42) + "..." : post.title}
              </h3>
              <Badge className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(post.status)}`} data-testid={`badge-status-${post.id}`}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
              {post.aiRated && (
                <Badge variant="secondary" className="px-2 py-1 text-xs bg-blue-100 text-blue-700" data-testid={`badge-ai-rated-${post.id}`}>
                  <Bot className="w-3 h-3 mr-1" />
                  AI Rated
                </Badge>
              )}
            </div>
            <p className="text-slate-600 text-sm line-clamp-3" data-testid={`text-body-preview-${post.id}`}>
              {post.body.substring(0, 150)}
              {post.body.length > 150 && "..."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span data-testid={`text-updated-${post.id}`}>
              {formatDistanceToNow(post.updatedAt, { addSuffix: true })}
            </span>
            <span data-testid={`text-length-${post.id}`}>
              {post.body.length} characters
            </span>
            {post.rating && (
              <div className="flex items-center gap-1">
                <span className="text-xs">•</span>
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span data-testid={`text-rating-${post.id}`}>
                  {post.rating}/10
                </span>
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs">•</span>
                <span data-testid={`text-tags-${post.id}`}>
                  {post.tags.join(", ")}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              data-testid={`button-copy-${post.id}`}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(post.id)}
              data-testid={`button-duplicate-${post.id}`}
            >
              <CopyCheck className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              data-testid={`button-export-${post.id}`}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid={`button-delete-${post.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onEdit(post.id)}
              size="sm"
              data-testid={`button-edit-${post.id}`}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
