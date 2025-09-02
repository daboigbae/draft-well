import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Star, Bell, Hash, ArrowRight, X } from 'lucide-react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
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
      title: "Write Your First Post",
      description: "Create and edit LinkedIn posts with our intuitive editor. Use markdown formatting, organize your content with tags, and draft your professional thoughts with ease.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bell,
      title: "Get It Rated",
      description: "Get AI-powered feedback on your posts to improve engagement. Receive personalized suggestions and ratings to make your content more compelling and effective.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Hash,
      title: "Manage Your Hashtags",
      description: "Organize your hashtag collections and track their performance. Build reusable hashtag sets and optimize your content strategy for maximum reach.",
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

  const ensureUserDocumentAndUpdate = async (updates: any) => {
    const userDocRef = doc(db, 'users', userId);
    
    try {
      // Try to update the document first
      await updateDoc(userDocRef, updates);
    } catch (error: any) {
      // If document doesn't exist, create it with the updates
      if (error.code === 'not-found') {
        try {
          await setDoc(userDocRef, {
            onboarded: {
              tutorial: false,
              firstDraft: false,
              ...updates
            }
          }, { merge: true });
        } catch (createError) {
          console.error('Error creating user document:', createError);
          throw createError;
        }
      } else {
        throw error;
      }
    }
  };

  const handleFinish = async () => {
    try {
      await ensureUserDocumentAndUpdate({
        'onboarded.tutorial': true
      });
      
      toast({
        title: "Welcome to Draftwell!",
        description: "You're all set to start creating amazing LinkedIn content.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error completing tutorial:', error);
      // Close the modal anyway to prevent being stuck
      onClose();
      toast({
        title: "Welcome to Draftwell!",
        description: "You're all set to start creating amazing LinkedIn content.",
      });
    }
  };

  const handleSkip = async () => {
    try {
      await ensureUserDocumentAndUpdate({
        'onboarded.tutorial': true
      });
      onClose();
    } catch (error) {
      console.error('Error skipping tutorial:', error);
      // Close the modal anyway to prevent being stuck
      onClose();
    }
  };

  const currentFeature = features[currentStep];
  const IconComponent = currentFeature.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // When the dialog's built-in close is triggered, run our skip logic
        handleSkip().catch(() => onClose());
      }
    }}>
      <DialogContent className="sm:max-w-lg" data-testid="tutorial-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Welcome to Draftwell
          </DialogTitle>
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