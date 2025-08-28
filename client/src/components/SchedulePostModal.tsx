import React, { useState } from 'react';
import { Plus, FileText, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Post } from '../types/post';
import { format } from 'date-fns';

interface SchedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: Date | null;
  draftPosts: Post[];
  onSelectDraft: (postId: string) => void;
  onCreateNew: () => void;
}

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  draftPosts,
  onSelectDraft,
  onCreateNew
}) => {
  if (!targetDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule for {format(targetDate, 'EEEE, MMM d')}
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to schedule a post for this day
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          
          {/* Create New Post Option */}
          <Button
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            data-testid="button-create-new-post"
          >
            <Plus className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Create New Post</div>
              <div className="text-sm text-blue-100">
                Start fresh with a new post scheduled for this day
              </div>
            </div>
          </Button>

          {/* Select Existing Draft */}
          {draftPosts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText className="w-4 h-4" />
                Or select an existing draft:
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {draftPosts.map((post) => (
                  <Button
                    key={post.id}
                    variant="outline"
                    onClick={() => {
                      onSelectDraft(post.id);
                      onClose();
                    }}
                    className="w-full justify-start h-auto p-3 text-left"
                    data-testid={`button-select-draft-${post.id}`}
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-medium text-slate-900 mb-1 truncate">
                        {post.title || 'Untitled Post'}
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {post.body.substring(0, 150)}
                        {post.body.length > 150 && '...'}
                      </p>
                      <div className="text-xs text-slate-500 truncate">
                        {post.body.length} characters
                        {post.rating && ` • ★ ${post.rating}/10`}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {draftPosts.length === 0 && (
            <div className="text-center py-4 text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No draft posts available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePostModal;