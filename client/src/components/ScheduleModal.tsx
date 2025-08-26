import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Clock } from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  onSchedule: (scheduledDate: Date) => void;
  currentScheduledAt?: Date | null;
}

export default function ScheduleModal({ 
  isOpen, 
  onClose, 
  onPublish, 
  onSchedule,
  currentScheduledAt 
}: ScheduleModalProps) {
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (currentScheduledAt) {
      return currentScheduledAt.toISOString().slice(0, 16);
    }
    // Default to 9:00 AM today, or 9:00 AM tomorrow if it's already past 9:00 AM
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    
    // If 9:00 AM today has already passed, default to 9:00 AM tomorrow
    if (defaultTime <= new Date()) {
      defaultTime.setDate(defaultTime.getDate() + 1);
    }
    
    return defaultTime.toISOString().slice(0, 16);
  });

  const handlePublishNow = () => {
    onPublish();
    onClose();
  };

  const handleSchedule = () => {
    const selectedDate = new Date(scheduleDate);
    if (selectedDate <= new Date()) {
      return; // Don't allow scheduling in the past
    }
    onSchedule(selectedDate);
    onClose();
  };

  const isDateInPast = new Date(scheduleDate) <= new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="schedule-modal">
        <DialogHeader>
          <DialogTitle>Publish or Schedule Post</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="publish" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="publish">Publish Now</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="publish" className="space-y-4">
            <p className="text-slate-600">
              Mark this post as published now? This will change the status to "Published" to help you track which posts you've shared on LinkedIn.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-publish"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublishNow}
                className="flex-1"
                data-testid="button-confirm-publish"
              >
                Mark as Published
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="schedule-datetime" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Date & Time
              </Label>
              <Input
                id="schedule-datetime"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                data-testid="input-schedule-datetime"
              />
              {isDateInPast && (
                <p className="text-sm text-red-600">
                  Please select a future date and time
                </p>
              )}
              <p className="text-sm text-slate-500">
                Your post will be marked as "Scheduled" and you can track it in your post list.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-schedule"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={isDateInPast}
                className="flex-1"
                data-testid="button-confirm-schedule"
              >
                Schedule Post
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
