import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Star, Bell, Hash, ArrowRight, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../hooks/use-toast';

interface TutorialModalProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export default function TutorialModal({ userId, open, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const features = [
    {
      icon: Star,
      title: "Organize & Get Your Posts Rated",
      description: "Create, organize, and get AI-powered ratings for your LinkedIn posts. Discover what makes content engaging and improve your writing with personalized feedback.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get intelligent reminders and insights to improve your LinkedIn posting experience. Never miss the perfect time to share your content with your network.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Hash,
      title: "Hashtag Performance Analytics",
      description: "Organize your hashtag collections and measure their performance. Track which tags drive the most engagement and optimize your content strategy.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'onboarded.tutorial': true
      });
      
      toast({
        title: "Welcome to Draftwell!",
        description: "You're all set to start creating amazing LinkedIn content.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error completing tutorial:', error);
      toast({
        title: "Error",
        description: "Failed to save tutorial progress.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'onboarded.tutorial': true
      });
      onClose();
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  const currentFeature = features[currentStep];
  const IconComponent = currentFeature.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" data-testid="tutorial-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Welcome to Draftwell
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-700"
              data-testid="button-skip-tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Progress Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-indigo-600'
                      : index < currentStep
                      ? 'bg-indigo-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Feature Content */}
          <div className="text-center">
            <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${currentFeature.color} mb-6`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              {currentFeature.title}
            </h3>
            
            <p className="text-slate-600 leading-relaxed mb-6">
              {currentFeature.description}
            </p>

            <Badge variant="outline" className="mb-6">
              {currentStep + 1} of {features.length}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
                data-testid="button-previous"
              >
                Previous
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              data-testid={currentStep === features.length - 1 ? "button-finish" : "button-next"}
            >
              {currentStep === features.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
              data-testid="link-skip-tutorial"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}