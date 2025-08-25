import { useState } from "react";
import { useLocation } from "wouter";
import { Star, Clock, BarChart3, Check, ChevronDown, ArrowRight, Zap, Users, Award } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Landing() {
  const [, setLocation] = useLocation();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">DW</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800">Draftwell</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/login')}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setLocation('/signup')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                data-testid="button-start-free"
              >
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6" data-testid="hero-headline">
            Write LinkedIn posts that get noticed.
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto" data-testid="hero-subheadline">
            Draftwell helps creators and professionals turn ideas into high-performing LinkedIn posts with AI feedback, reminders, and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => setLocation('/signup')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg px-8 py-3"
              data-testid="button-hero-start-free"
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToFeatures}
              className="text-lg px-8 py-3"
              data-testid="button-hero-see-how"
            >
              See How It Works
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed on LinkedIn</h2>
            <p className="text-xl text-slate-600">Stop guessing what will work. Start creating with confidence.</p>
          </div>

          <div className="space-y-20">
            {/* Feature 1: AI Ratings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">Know before you post.</h3>
                </div>
                <p className="text-lg text-slate-600 mb-6">
                  Get instant AI ratings (1–10) and actionable suggestions so every post has the best chance to perform.
                </p>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold text-slate-900">AI Rating: 8/10</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Great hook and valuable insights! Consider adding a specific statistic to strengthen your opening.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Check className="h-4 w-4" />
                    <span>High engagement potential</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <Star className="h-4 w-4 fill-current" />
                      Get Rating
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-20"></div>
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                          <Star className="h-6 w-6 fill-current" />
                          9/10
                        </div>
                        <div className="text-sm text-gray-500">AI Rated</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800">Posting Schedule</h4>
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-800">Post in 2 hours</div>
                          <div className="text-xs text-green-600">"Every founder thinks their first version..."</div>
                        </div>
                        <div className="text-xs text-green-600">9:00 AM</div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-800">Check performance</div>
                          <div className="text-xs text-blue-600">1h after posting</div>
                        </div>
                        <div className="text-xs text-blue-600">10:00 AM</div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-purple-800">Follow-up check</div>
                          <div className="text-xs text-purple-600">24h performance review</div>
                        </div>
                        <div className="text-xs text-purple-600">Tomorrow</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">Never miss the right moment.</h3>
                </div>
                <p className="text-lg text-slate-600 mb-6">
                  Stay consistent with post reminders and performance check-ins at 1h, 12h, and 24h.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-700">Post scheduled for 9:00 AM</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-700">Check performance in 1 hour</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-slate-700">Weekly analytics summary</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">See what works (and why).</h3>
                </div>
                <p className="text-lg text-slate-600 mb-6">
                  Track hashtags, keywords, and post performance over time so you always know how to improve.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">+127%</div>
                    <div className="text-sm text-slate-600">Engagement boost</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">#ai</div>
                    <div className="text-sm text-slate-600">Top hashtag</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">Performance Analytics</h4>
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+127%</div>
                      <div className="text-sm text-green-700">Engagement</div>
                      <div className="text-xs text-green-600">vs last month</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">8.4</div>
                      <div className="text-sm text-blue-700">Avg Rating</div>
                      <div className="text-xs text-blue-600">last 10 posts</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">Top Hashtags</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">#ai</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">#startup</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">#founder</span>
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 rounded-lg flex items-end justify-around p-2">
                    <div className="w-4 bg-green-500 rounded-t" style={{height: '60%'}}></div>
                    <div className="w-4 bg-blue-500 rounded-t" style={{height: '80%'}}></div>
                    <div className="w-4 bg-purple-500 rounded-t" style={{height: '40%'}}></div>
                    <div className="w-4 bg-green-500 rounded-t" style={{height: '90%'}}></div>
                    <div className="w-4 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-slate-600">Start free, upgrade when you're ready to grow faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">2 AI ratings/week</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Unlimited drafts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Hashtag collections</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setLocation('/signup')}
                  data-testid="button-free-plan"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="relative border-purple-200 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>For consistent creators</CardDescription>
                <div className="text-3xl font-bold">$9<span className="text-lg text-slate-600">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">20 AI ratings/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Basic reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Draft organization</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setLocation('/signup')}
                  data-testid="button-starter-plan"
                >
                  Upgrade to Starter
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="text-3xl font-bold">$19<span className="text-lg text-slate-600">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Unlimited AI ratings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Advanced reminders (1h/12h/24h)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Idea generator from your top posts</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setLocation('/signup')}
                  data-testid="button-pro-plan"
                >
                  Go Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop guessing. Start posting with confidence.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join creators growing their LinkedIn with Draftwell today.
          </p>
          <Button 
            size="lg" 
            onClick={() => setLocation('/signup')}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
            data-testid="button-final-cta"
          >
            Start Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">DW</span>
              </div>
              <span className="text-xl font-bold">Draftwell</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            © 2025 Draftwell. Built by Digital Art Dealers. Not affiliated with LinkedIn Corporation.
          </div>
        </div>
      </footer>
    </div>
  );
}