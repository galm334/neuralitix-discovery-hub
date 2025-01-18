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
        currentPath: location.pathname,
        requireProfile
      });

      if (!isLoading) {
        // If no session, redirect to auth except for /auth path
        if (!session && location.pathname !== '/auth') {
          logger.info("No session found, redirecting to auth");
          navigate("/auth", { replace: true });
          return;
        }

        // If we have a session but no profile and profile is required
        if (session && !profile && requireProfile) {
          // Allow access to onboarding
          if (location.pathname !== '/onboarding') {
            logger.info("No profile found, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
            return;
          }
        }

        // If we have both session and profile
        if (session && profile) {
          // Redirect from auth page to home
          if (location.pathname === '/auth') {
            logger.info("Already authenticated, redirecting to home");
            navigate("/", { replace: true });
            return;
          }
          
          // Redirect from onboarding if profile exists
          if (location.pathname === '/onboarding') {
            logger.info("Profile exists, redirecting from onboarding to home");
            navigate("/", { replace: true });
            return;
          }
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

  // For protected routes, show nothing while redirecting if no session
  if (!session && requireProfile) {
    return null;
  }

  // For routes that require a profile, show nothing while redirecting if no profile
  if (requireProfile && !profile) {
    return null;
  }

  return <>{children}</>;
};