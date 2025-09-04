import React from 'react';
import { Clock, Edit3, Copy, Trash2, CalendarDays, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Post } from '../types/post';
import { formatDistanceToNow, isToday, isTomorrow, isThisWeek, startOfDay, isAfter, isBefore, addDays, format, isSameDay } from 'date-fns';

interface ScheduledPostsViewProps {
  posts: Post[];
  allPosts: Post[];
  onEdit: (postId: string) => void;
  onDuplicate: (postId: string) => void;
  onDelete: (postId: string) => void;
  onScheduleForDay: (date: Date) => void;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  dateString: string;
  isToday: boolean;
  isTomorrow: boolean;
  posts: Post[];
  isEmpty: boolean;
}

const ScheduledPostsView: React.FC<ScheduledPostsViewProps> = ({ 
  posts, 
  allPosts,
  onEdit, 
  onDuplicate, 
  onDelete,
  onScheduleForDay 
}) => {
  const getNext7Days = (): DaySchedule[] => {
    const today = startOfDay(new Date());
    const days: DaySchedule[] = [];

    for (let i = 1; i <= 7; i++) {
      const date = addDays(today, i);
      const dayPosts = posts.filter(post => {
        if (!post.scheduledAt) return false;
        console.log(`Comparing post scheduledAt: ${post.scheduledAt.toISOString()} with target date: ${date.toISOString()}`);
        return isSameDay(post.scheduledAt, date);
      });

      days.push({
        date,
        dayName: format(date, 'EEEE'),
        dateString: format(date, 'MMM d'),
        isToday: false,
        isTomorrow: i === 1,
        posts: dayPosts.sort((a, b) => {
          if (!a.scheduledAt || !b.scheduledAt) return 0;
          return a.scheduledAt.getTime() - b.scheduledAt.getTime();
        }),
        isEmpty: dayPosts.length === 0
      });
    }

    return days;
  };

  const next7Days = getNext7Days();

  // Show overdue posts (including today) at the top
  const overduePosts = posts.filter(post => 
    post.scheduledAt && isBefore(post.scheduledAt, addDays(startOfDay(new Date()), 1))
  );

  return (
    <div className="space-y-6">
      {/* Overdue posts section */}
      {overduePosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border-red-200 border">
              <Clock className="w-4 h-4 text-red-600" />
              <h3 className="font-semibold text-red-700">Overdue</h3>
              <Badge variant="secondary" className="ml-2">
                {overduePosts.length}
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <div className="space-y-3">
            {overduePosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border border-red-200 p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
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
                    </div>
                    
                    <h4 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                      {post.title || 'Untitled Post'}
                    </h4>
                    
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                      {post.body.substring(0, 120)}
                      {post.body.length > 120 && '...'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(post.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next 7 days */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Next 7 Days</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        
        <div className="grid gap-4">
          {next7Days.map((day) => (
            <div key={day.date.toISOString()} className="bg-white rounded-lg border border-gray-200 p-4">
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-lg font-semibold ${
                    day.isTomorrow 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {day.isTomorrow ? 'Tomorrow' : day.dayName}
                  </div>
                  <span className="text-slate-600 font-medium">{day.dateString}</span>
                  {day.posts.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {day.posts.length} post{day.posts.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Posts for this day */}
              {day.isEmpty ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <CalendarDays className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                  <h4 className="font-medium text-slate-700 mb-2">No posts scheduled</h4>
                  <p className="text-sm text-slate-500 mb-4">
                    {day.isTomorrow
                      ? "Tomorrow is a great day to share insights with your network."
                      : `Consider scheduling a post for ${day.dayName} to maintain consistent engagement.`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs border-gray-300 hover:border-gray-400"
                    onClick={() => onScheduleForDay(day.date)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Schedule Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {day.posts.map((post) => (
                    <div key={post.id} className="bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Clock className="w-4 h-4" />
                              <span>
                                {post.scheduledAt?.toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit', 
                                  hour12: true 
                                })}
                              </span>
                            </div>
                            {post.rating && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                ★ {post.rating}/10
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                            {post.title || 'Untitled Post'}
                          </h4>
                          
                          <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                            {post.body.substring(0, 100)}
                            {post.body.length > 100 && '...'}
                          </p>

                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-slate-500 px-2 py-1">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduledPostsView;