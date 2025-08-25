import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink, MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { createFeedback } from "../lib/feedback";

const feedbackSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  text: z.string().min(10, "Feedback must be at least 10 characters long").max(1000, "Feedback must not exceed 1000 characters"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: "",
      text: "",
    },
  });

  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    try {
      await createFeedback(data);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it and get back to you if needed.",
      });
      form.reset();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to submit feedback",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-4 mt-auto">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left - Built by */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Built by</span>
            <a
              href="https://digitalartdealers.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              data-testid="link-digital-art-dealers"
            >
              Digital Art Dealers
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Middle - Copyright */}
          <div className="text-sm text-slate-500">
            © {currentYear} Draftwell. All rights reserved.
          </div>

          {/* Right - Feedback */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                data-testid="button-feedback"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Send Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  Help us improve Draftwell by sharing your thoughts, suggestions, or reporting issues.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Email</Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...form.register("email")}
                    data-testid="input-feedback-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600" data-testid="error-feedback-email">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback-text">Feedback</Label>
                  <Textarea
                    id="feedback-text"
                    placeholder="Share your thoughts, suggestions, or report any issues..."
                    rows={4}
                    {...form.register("text")}
                    data-testid="textarea-feedback-text"
                  />
                  <div className="flex justify-between items-center">
                    {form.formState.errors.text && (
                      <p className="text-sm text-red-600" data-testid="error-feedback-text">
                        {form.formState.errors.text.message}
                      </p>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      {form.watch("text")?.length || 0}/1000
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-feedback"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-submit-feedback"
                  >
                    {isSubmitting ? "Submitting..." : "Send Feedback"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bottom Disclaimer Row */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-400">
            <span>We respect your privacy and do not store unnecessary data.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Not affiliated with LinkedIn Corporation.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}