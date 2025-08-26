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

            {/* Version 3.1.0 */}
            <div className="mb-8" data-testid="version-3-1-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 3.1.0</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Latest
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 26, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🎛️ Enhanced UI/UX Controls</h3>
                  <p className="text-slate-600 mb-4">
                    Major interface improvements focused on space optimization and user control over the workspace layout.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Collapsible Sidebar Menu:</strong> Sidebar can now be hidden/shown with a toggle button for maximum content space</li>
                    <li><strong>Fixed Sidebar Layout:</strong> Left sidebar stays fixed while main content scrolls independently for better navigation</li>
                    <li><strong>Expandable Filter Section:</strong> Search and filter controls can be collapsed to provide more room for post viewing</li>
                    <li><strong>Smart Icon Updates:</strong> Toggle buttons show appropriate icons (X when open, Menu when closed) for clear visual feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">📐 Layout Optimizations</h3>
                  <p className="text-slate-600 mb-4">
                    Improved workspace management and content organization for better productivity.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Dynamic Content Expansion:</strong> Main content area automatically expands to full width when sidebar is hidden</li>
                    <li><strong>Filter Status Reordering:</strong> Post filters now appear in logical order: All Posts, Drafts, Scheduled, Published</li>
                    <li><strong>Cleaner Navigation:</strong> Simplified sidebar with user icon moved to Account section for consistency</li>
                    <li><strong>Smooth Animations:</strong> All layout changes include smooth transitions for professional feel</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Technical Improvements</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Fixed layout positioning for proper scroll behavior</li>
                    <li>Enhanced responsive design with better mobile/desktop consistency</li>
                    <li>Improved state management for UI toggles</li>
                    <li>Optimized CSS for smoother animations and transitions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 3.0.0 */}
            <div className="mb-8" data-testid="version-3-0-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 3.0.0</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 24, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">📱 Mobile-First Responsive Design</h3>
                  <p className="text-slate-600 mb-4">
                    Complete mobile responsiveness overhaul with touch-optimized interface and adaptive layouts.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Responsive Sidebar:</strong> Collapsible sidebar with hamburger menu for mobile devices</li>
                    <li><strong>Mobile-Optimized Cards:</strong> Post cards redesigned for touch interaction with improved spacing</li>
                    <li><strong>Vertical Editor Layout:</strong> Editor automatically adapts to vertical layout on smaller screens</li>
                    <li><strong>Touch Targets:</strong> All interactive elements meet accessibility standards for mobile use</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">💬 User Feedback System</h3>
                  <p className="text-slate-600 mb-4">
                    Integrated feedback collection system allowing users to share suggestions and report issues directly from the app.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Footer Integration:</strong> "Send Feedback" button accessible from every page</li>
                    <li><strong>Modal Dialog:</strong> Clean, professional feedback form with email and text inputs</li>
                    <li><strong>Firebase Storage:</strong> Feedback stored securely in Firestore with timestamps</li>
                    <li><strong>Form Validation:</strong> Email validation and character limits (10-1000 characters) with real-time feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">✨ User Experience Improvements</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Simplified Pro Display:</strong> Pro users now see "Unlimited" instead of token counts for cleaner UI</li>
                    <li><strong>Enhanced Subscription Management:</strong> Improved error handling for subscription operations</li>
                    <li><strong>Cleaner Branding:</strong> Removed promotional text for more professional appearance</li>
                    <li><strong>Fixed Mobile Scrolling:</strong> Resolved menu scrolling issues on mobile devices</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Technical Updates</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Updated Firestore security rules for feedback collection</li>
                    <li>New feedback.ts library for Firebase integration</li>
                    <li>Enhanced responsive breakpoints and CSS optimization</li>
                    <li>Improved touch and accessibility standards compliance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2.0.0 */}
            <div className="mb-8" data-testid="version-2-0-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 2.0.0</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🤖 AI Rating System</h3>
                  <p className="text-slate-600 mb-4">
                    Introducing our most significant update yet: AI-powered post rating and suggestions. Get instant feedback on your LinkedIn content quality.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Smart AI Ratings:</strong> Get posts rated from 1-10 based on content quality, engagement potential, and LinkedIn best practices</li>
                    <li><strong>Personalized Suggestions:</strong> Receive specific, actionable recommendations to improve your posts</li>
                    <li><strong>Cloud Function Integration:</strong> Powered by Firebase cloud functions for fast, reliable AI analysis</li>
                    <li><strong>Character Validation:</strong> Posts must be 100-1000 characters for rating (with helpful validation messages)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">📊 Enhanced Post Management</h3>
                  <p className="text-slate-600 mb-4">
                    New visual indicators and improved organization for AI-rated content.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>AI Rated Badges:</strong> Visual indicators showing which posts have been analyzed by AI</li>
                    <li><strong>Rating Display:</strong> See your post scores directly in the post list with star ratings</li>
                    <li><strong>Live Preview Badge:</strong> AI rated status shown prominently in the editor preview</li>
                    <li><strong>Automatic Status Tracking:</strong> aiRated flag automatically managed based on rating data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🎯 User Experience Improvements</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Title Character Limit:</strong> Titles now support up to 120 characters input, displayed with 42-character truncation and ellipsis</li>
                    <li><strong>Improved Rating Flow:</strong> Rating → Preview → Suggestions layout for optimal user experience</li>
                    <li><strong>Backend-Driven Logic:</strong> Rating status based on actual data rather than manual flags</li>
                    <li><strong>Professional UI:</strong> Purple accent badges and clean rating displays</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Technical Architecture</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>New rating.ts library for AI integration</li>
                    <li>Updated Post schema with rating and suggestions fields</li>
                    <li>Firestore security rules updated for new data structure</li>
                    <li>Comprehensive TypeScript typing for rating system</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.1.2 */}
            <div className="mb-8" data-testid="version-1-1-2">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.1.2</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Released: August 23, 2025</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">📋 Enhanced Copy Functionality</h3>
                  <p className="text-slate-600 mb-4">
                    Improved the copy-to-clipboard feature to preserve formatting and structure when copying posts to LinkedIn.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li><strong>Preserves Bold Text:</strong> Bold formatting content is maintained when copying (removes ** but keeps emphasized text)</li>
                    <li><strong>Maintains Line Breaks:</strong> Single and double line breaks are properly preserved for better readability</li>
                    <li><strong>LinkedIn-Optimized:</strong> Removes markdown syntax while keeping the intended text structure</li>
                    <li><strong>Clean Headings:</strong> Converts # headings to clean text without losing content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3">🔧 Technical Improvements</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                    <li>Updated both post card and editor copy functions</li>
                    <li>New LinkedIn-specific text conversion utility</li>
                    <li>Better handling of markdown-to-text conversion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 1.2.0 */}
            <div className="mb-8" data-testid="version-1-2-0">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">Version 1.2.0</h2>
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