import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import AuthGuard from "./components/AuthGuard";
import PostList from "./pages/PostList";
import Editor from "./pages/Editor";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/app/post/:id" component={Editor} />
      <Route path="/app" component={PostList} />
      <Route path="/" component={() => <PostList />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGuard>
          <Router />
        </AuthGuard>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
