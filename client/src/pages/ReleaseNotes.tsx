import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import AppLayout from "./AppLayout";

export default function ReleaseNotes() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout>
      <div className="flex-1 p-8" data-testid="release-notes">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/app')}
              className="flex items-center gap-2"
              data-testid="button-back-to-posts"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="title-release-notes">
                Release Notes
              </h1>
              <p className="text-slate-600">
                Stay up to date with the latest features and improvements in Linkedraft.
              </p>
            </div>

            {/* Version 1.0.0 */}
            <div className="mb-8" data-testid="version-1-0-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.0.0</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Latest
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🎉 Initial Release</h3>
                  <p className="text-slate-600 mb-4">
                    Welcome to Linkedraft! The complete LinkedIn post management application built for content creators and professionals.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">✨ Key Features</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Rich Markdown Editor:</strong> Write posts with full markdown support and live preview
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>LinkedIn-Style Preview:</strong> See exactly how your posts will look with "...more" functionality
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Character Counter:</strong> Stay within LinkedIn's 3000 character limit with visual warnings
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Auto-Save:</strong> Never lose your work with intelligent auto-save functionality
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>AI Vetting Flag:</strong> Mark posts that have been reviewed or improved by AI tools
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Post Management:</strong> Organize posts by draft/published status with search and filtering
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Export & Copy:</strong> Easily copy posts to clipboard or export as text files
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Firebase Authentication:</strong> Secure sign-in with email/password or Google OAuth
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Real-time Sync:</strong> Your posts sync across all your devices automatically
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Technical Highlights</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Built with React 18, TypeScript, and Tailwind CSS
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Firebase Firestore for real-time data synchronization
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Modern UI components with shadcn/ui and Radix UI
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Responsive design optimized for desktop and mobile
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <p className="text-slate-500 text-sm">
                Have feedback or feature requests? We'd love to hear from you! 
                Your input helps make Linkedraft better for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}