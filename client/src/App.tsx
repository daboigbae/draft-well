import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import AuthGuard from "./components/AuthGuard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PostList from "./pages/PostList";
import Editor from "./pages/Editor";
import NotFound from "./pages/not-found";

function ProtectedRoutes() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/app/post/:id" component={Editor} />
        <Route path="/app" component={PostList} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/app/*" nest component={ProtectedRoutes} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
