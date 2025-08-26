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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or interactive elements
    if (e.target instanceof HTMLElement && (
      e.target.closest('button') || 
      e.target.closest('[role="button"]') ||
      e.target.closest('a')
    )) {
      return;
    }
    onEdit(post.id);
  };

  return (
    <div 
      className="group bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300/80 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden" 
      data-testid={`card-post-${post.id}`}
      onClick={handleCardClick}
    >
      <div className="p-5 sm:p-6">
        {/* Header Section */}
        <div className="mb-5">
          {/* Status Badge and AI Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`} data-testid={`badge-status-${post.id}`}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
              {post.rating && (
                <Badge variant="outline" className="px-2 py-1 text-xs bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700" data-testid={`badge-ai-rated-${post.id}`}>
                  <Bot className="w-3 h-3 mr-1" />
                  AI Rated
                </Badge>
              )}
            </div>
            {post.rating && (
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 text-amber-500 fill-current" />
                <span className="text-xs font-medium text-amber-700" data-testid={`text-rating-${post.id}`}>
                  {post.rating}/10
                </span>
              </div>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-700 transition-colors" data-testid={`text-title-${post.id}`}>
            {post.title.length > 60 ? post.title.substring(0, 60) + "..." : post.title}
          </h3>
          
          {/* Body Preview */}
          <p className="text-slate-600 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed" data-testid={`text-body-preview-${post.id}`}>
            {post.body.substring(0, 150)}
            {post.body.length > 150 && "..."}
          </p>
        </div>
        
        {/* Metadata and Tags Section */}
        <div className="space-y-4">
          {/* Scheduled date display */}
          {post.status === "scheduled" && post.scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-xl border border-orange-200">
              <Clock className="w-4 h-4" />
              <span data-testid={`text-scheduled-${post.id}`} className="font-medium">
                Scheduled for {post.scheduledAt.toLocaleString()}
              </span>
            </div>
          )}
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium"
                  data-testid={`tag-${post.id}-${index}`}
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-slate-500 font-medium">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span data-testid={`text-updated-${post.id}`} className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(post.updatedAt, { addSuffix: true })}
              </span>
              <span data-testid={`text-length-${post.id}`} className="hidden sm:inline">
                {post.body.length} chars
              </span>
            </div>
            <div className="sm:hidden text-xs text-slate-500">
              {post.body.length} chars
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Modern layout */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100/80">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              data-testid={`button-copy-${post.id}`}
              title="Copy post content"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(post.id)}
              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
              data-testid={`button-duplicate-${post.id}`}
              title="Duplicate post"
            >
              <CopyCheck className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors"
              data-testid={`button-export-${post.id}`}
              title="Export as text file"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
              data-testid={`button-delete-${post.id}`}
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => onEdit(post.id)}
            size="sm"
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            data-testid={`button-edit-${post.id}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Post
          </Button>
        </div>
      </div>
    </div>
  );
}