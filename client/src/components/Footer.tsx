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
        <div className="flex items-center justify-center">
          {/* Copyright */}
          <div className="text-sm text-slate-500">
            © {currentYear} Draftwell. All rights reserved.
          </div>
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