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
                Stay up to date with the latest features and improvements in Draftwell.
              </p>
            </div>

            {/* Version 1.2.0 */}
            <div className="mb-8" data-testid="version-1-2-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.2.0</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Latest
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🎨 Brand Refresh: Welcome to Draftwell</h3>
                  <p className="text-slate-600 mb-4">
                    We've rebranded from Linkedraft to <strong>Draftwell</strong>! Our new name better reflects our mission to help you draft well-crafted LinkedIn content.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Updated application name throughout the interface</li>
                    <li>Refreshed welcome messages and branding</li>
                    <li>New identity focused on quality content creation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🌈 New Color Palette</h3>
                  <p className="text-slate-600 mb-4">
                    Introducing a fresh, modern color scheme designed for better usability and visual appeal.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Primary:</strong> Professional Indigo 600 for brand consistency</li>
                    <li><strong>Accent:</strong> Vibrant Sky Blue 400 for highlights and actions</li>
                    <li><strong>Neutral:</strong> Clean Slate tones for optimal readability</li>
                    <li><strong>Success:</strong> Fresh Emerald 500 for positive confirmations</li>
                    <li>Enhanced contrast and accessibility across light and dark modes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">✨ Enhanced User Experience</h3>
                  <p className="text-slate-600 mb-4">
                    The new design language provides a more cohesive and professional experience.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Consistent color application across all components</li>
                    <li>Improved visual hierarchy and readability</li>
                    <li>Professional appearance suitable for business use</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.1.1 */}
            <div className="mb-8" data-testid="version-1-1-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.1.1</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔒 Closed Beta Access</h3>
                  <p className="text-slate-600 mb-4">
                    Draftwell is now in closed beta. Authentication has been streamlined for invite-only access.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Changes</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <div>
                        <strong>Removed Google Sign-in:</strong> Google OAuth authentication has been disabled for the closed beta period
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <div>
                        <strong>Removed Public Sign-up:</strong> New user registration is now invite-only through admin access
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <div>
                        <strong>Simplified Login:</strong> Login interface now only shows email/password fields for existing users
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.1.0 */}
            <div className="mb-8" data-testid="version-1-1-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.1.0</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🏷️ Enhanced Tag Management</h3>
                  <p className="text-slate-600 mb-4">
                    This update significantly improves how you work with tags, making them more powerful and easier to reuse across your posts.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">✨ New Features</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Smart Tag Auto-Complete:</strong> Tags now auto-complete from your previous posts as you type, making tag entry faster and more consistent
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Tag-Based Filtering:</strong> New sidebar filter to view posts by specific tags, helping you organize and find content by topic
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Enhanced Tag Input:</strong> Improved tag input with real-time suggestions dropdown and multiple input methods (Enter, comma, or + button)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <strong>Improved Copy Function:</strong> Copy button now copies clean, formatted text instead of raw markdown for better pasting into LinkedIn
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Technical Improvements</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Real-time tag synchronization across all posts
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Enhanced markdown-to-plaintext conversion for better copy functionality
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Improved dark mode support for new components
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.0.0 */}
            <div className="mb-8" data-testid="version-1-0-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.0.0</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🎉 Initial Release</h3>
                  <p className="text-slate-600 mb-4">
                    Welcome to Draftwell! The complete LinkedIn post management application built for content creators and professionals.
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
                Your input helps make Draftwell better for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}