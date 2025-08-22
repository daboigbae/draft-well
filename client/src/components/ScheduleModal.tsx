import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
}

export default function ScheduleModal({ isOpen, onClose, onPublish }: ScheduleModalProps) {
  const handlePublish = () => {
    onPublish();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="publish-modal">
        <DialogHeader>
          <DialogTitle>Publish Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-slate-600">
            Mark this post as published? This will change the status to "Published" to help you track which posts you've shared on LinkedIn.
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-publish"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            className="flex-1"
            data-testid="button-confirm-publish"
          >
            Mark as Published
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
