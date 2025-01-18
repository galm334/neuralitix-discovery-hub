import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/utils/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute = ({ children, requireProfile = true }: ProtectedRouteProps) => {
  const { session, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      logger.info("Protected Route - Checking auth", {
        hasSession: !!session,
        hasProfile: !!profile,
        isLoading,
        currentPath: location.pathname
      });

      if (!isLoading) {
        // If we're on /auth and have a session, check profile status
        if (location.pathname === '/auth' && session) {
          if (!profile && requireProfile) {
            logger.info("User authenticated but no profile, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
            return;
          }
          logger.info("User is authenticated, redirecting to home");
          navigate("/", { replace: true });
          return;
        }

        // Only redirect to /auth if there's no session and we're not already on /auth
        if (!session && location.pathname !== '/auth') {
          logger.info("No session found, redirecting to auth");
          navigate("/auth", { replace: true });
          return;
        }

        // Only check profile requirements if we have a session and requireProfile is true
        if (session && requireProfile && !profile) {
          if (location.pathname !== '/onboarding') {
            logger.info("No profile found, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
            return;
          }
        }

        // Redirect from onboarding if profile exists
        if (location.pathname === '/onboarding' && profile) {
          logger.info("Profile exists, redirecting from onboarding to home");
          navigate("/", { replace: true });
          return;
        }
      }
    };

    checkAuth();
  }, [session, profile, isLoading, navigate, location.pathname, requireProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!session || (requireProfile && !profile)) {
    return null;
  }

  return <>{children}</>;
};