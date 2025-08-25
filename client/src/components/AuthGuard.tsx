import { ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";
import Login from "../pages/Login";
import { Skeleton } from "./ui/skeleton";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}
