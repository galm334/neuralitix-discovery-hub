import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔒 Protected Route - Session:", session ? "Present" : "None");
    console.log("⌛ Protected Route - Loading:", isLoading);

    if (!isLoading && !session) {
      console.log("🚫 No session found, redirecting to auth");
      navigate("/auth", { replace: true });
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return session ? <>{children}</> : null;
};