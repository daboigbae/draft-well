import React from 'react';
import { Clock, Edit3, Copy, Trash2, CalendarDays } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Post } from '../types/post';
import { formatDistanceToNow, isToday, isTomorrow, isThisWeek, startOfDay, isAfter, isBefore, addDays } from 'date-fns';

interface ScheduledPostsViewProps {
  posts: Post[];
  onEdit: (postId: string) => void;
  onDuplicate: (postId: string) => void;
  onDelete: (postId: string) => void;
}

interface PostGroup {
  title: string;
  posts: Post[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const ScheduledPostsView: React.FC<ScheduledPostsViewProps> = ({ 
  posts, 
  onEdit, 
  onDuplicate, 
  onDelete 
}) => {
  const groupPostsByTime = (posts: Post[]): PostGroup[] => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);

    const groups: PostGroup[] = [
      { 
        title: 'Overdue', 
        posts: [], 
        color: 'text-red-700', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200' 
      },
      { 
        title: 'Today', 
        posts: [], 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200' 
      },
      { 
        title: 'Tomorrow', 
        posts: [], 
        color: 'text-green-700', 
        bgColor: 'bg-green-50', 
        borderColor: 'border-green-200' 
      },
      { 
        title: 'This Week', 
        posts: [], 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-50', 
        borderColor: 'border-purple-200' 
      },
      { 
        title: 'Later', 
        posts: [], 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-50', 
        borderColor: 'border-orange-200' 
      }
    ];

    posts.forEach(post => {
      if (!post.scheduledAt) return;

      const scheduledDate = post.scheduledAt;
      
      if (isBefore(scheduledDate, now)) {
        groups[0].posts.push(post); // Overdue
      } else if (isToday(scheduledDate)) {
        groups[1].posts.push(post); // Today
      } else if (isTomorrow(scheduledDate)) {
        groups[2].posts.push(post); // Tomorrow
      } else if (isThisWeek(scheduledDate)) {
        groups[3].posts.push(post); // This Week
      } else {
        groups[4].posts.push(post); // Later
      }
    });

    return groups.filter(group => group.posts.length > 0);
  };

  const groupedPosts = groupPostsByTime(posts);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <CalendarDays className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">No scheduled posts</h3>
        <p className="text-slate-600">
          Schedule your posts to publish them at the perfect time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedPosts.map((group, groupIndex) => (
        <div key={group.title} className="space-y-4">
          {/* Group Header */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${group.bgColor} ${group.borderColor} border`}>
              <Clock className="w-4 h-4" />
              <h3 className={`font-semibold ${group.color}`}>{group.title}</h3>
              <Badge variant="secondary" className="ml-2">
                {group.posts.length}
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Posts in this group */}
          <div className="space-y-3">
            {group.posts.map((post, postIndex) => (
              <div
                key={post.id}
                className={`bg-white rounded-lg border ${group.borderColor} p-4 hover:shadow-md transition-shadow group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    {/* Time and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex items-center gap-2 text-sm ${group.color} font-medium`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          {post.scheduledAt?.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {post.scheduledAt && formatDistanceToNow(post.scheduledAt, { addSuffix: true })}
                      </div>
                      {post.rating && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          ★ {post.rating}/10
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                      {post.title || 'Untitled Post'}
                    </h4>

                    {/* Body Preview */}
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                      {post.body.substring(0, 120)}
                      {post.body.length > 120 && '...'}
                    </p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-slate-500">
                      {post.body.length} characters • Updated {formatDistanceToNow(post.updatedAt, { addSuffix: true })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(post.id)}
                      className="h-8 w-8 p-0"
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(post.id)}
                      className="h-8 w-8 p-0"
                      data-testid={`button-duplicate-${post.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(post.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledPostsView;