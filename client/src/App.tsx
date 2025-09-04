import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import AuthGuard from "./components/AuthGuard";
import PostList from "./pages/PostList";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";
import ReleaseNotes from "./pages/ReleaseNotes";
import HashtagCollections from "./pages/HashtagCollections";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import NotFound from "./pages/not-found";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/app/post/:id" component={Editor} />
      <Route path="/app/account" component={Settings} />
      <Route path="/app/release-notes" component={ReleaseNotes} />
      <Route path="/app/hashtag-collections" component={HashtagCollections} />
      <Route path="/app" component={PostList} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/signin" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={Landing} />
      <Route>
        <AuthGuard>
          <AuthenticatedRouter />
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
