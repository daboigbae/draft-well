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
      case "scheduled":
        return "secondary";
      case "draft":
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "scheduled":
        return "bg-orange-100 text-orange-700";
      case "draft":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow" data-testid={`card-post-${post.id}`}>
      <div className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="mb-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-800 mb-2 leading-tight" data-testid={`text-title-${post.id}`}>
            {post.title.length > 60 ? post.title.substring(0, 60) + "..." : post.title}
          </h3>
          
          {/* Badges - Stack on mobile */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(post.status)}`} data-testid={`badge-status-${post.id}`}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
            {post.rating && (
              <Badge variant="secondary" className="px-2 py-1 text-xs bg-blue-100 text-blue-700" data-testid={`badge-ai-rated-${post.id}`}>
                <Bot className="w-3 h-3 mr-1" />
                AI Rated
              </Badge>
            )}
          </div>
          
          {/* Body Preview */}
          <p className="text-slate-600 text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed" data-testid={`text-body-preview-${post.id}`}>
            {post.body.substring(0, 120)}
            {post.body.length > 120 && "..."}
          </p>
        </div>
        
        {/* Metadata Section - More vertical on mobile */}
        <div className="space-y-3 sm:space-y-2">
          {/* First row: Time and character count */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-500">
            <span data-testid={`text-updated-${post.id}`}>
              {formatDistanceToNow(post.updatedAt, { addSuffix: true })}
            </span>
            <span data-testid={`text-length-${post.id}`} className="sm:hidden lg:inline">
              {post.body.length} characters
            </span>
          </div>

          {/* Scheduled date display */}
          {post.status === "scheduled" && post.scheduledAt && (
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              <Clock className="w-3 h-3" />
              <span data-testid={`text-scheduled-${post.id}`}>
                Scheduled for {post.scheduledAt.toLocaleString()}
              </span>
            </div>
          )}
          
          {/* Second row: Tags and rating (if they exist) */}
          {(post.tags.length > 0 || post.rating) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {post.tags.length > 0 && (
                <span data-testid={`text-tags-${post.id}`} className="truncate max-w-[200px]">
                  {post.tags.slice(0, 2).join(", ")}{post.tags.length > 2 && ` +${post.tags.length - 2}`}
                </span>
              )}
              {post.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span data-testid={`text-rating-${post.id}`}>
                    {post.rating}/10
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons - Better mobile layout */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {/* Left side: Character count on mobile */}
            <div className="sm:hidden text-xs text-slate-500">
              {post.body.length} chars
            </div>
            
            {/* Right side: Action buttons */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                data-testid={`button-copy-${post.id}`}
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(post.id)}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                data-testid={`button-duplicate-${post.id}`}
              >
                <CopyCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                data-testid={`button-export-${post.id}`}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid={`button-delete-${post.id}`}
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                onClick={() => onEdit(post.id)}
                size="sm"
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
                data-testid={`button-edit-${post.id}`}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}