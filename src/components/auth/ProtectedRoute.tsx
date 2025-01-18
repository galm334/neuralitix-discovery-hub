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
        // If we're on /auth and have a session, check where to redirect
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

        // For protected routes that require authentication
        if (!session && location.pathname !== '/auth') {
          logger.info("No session found, redirecting to auth");
          navigate("/auth", { replace: true });
          return;
        }

        // Only enforce profile requirement for routes that need it
        if (session && requireProfile && !profile) {
          // Allow access to onboarding
          if (location.pathname !== '/onboarding') {
            logger.info("Protected route requires profile, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
            return;
          }
        }

        // Prevent accessing onboarding if profile exists
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