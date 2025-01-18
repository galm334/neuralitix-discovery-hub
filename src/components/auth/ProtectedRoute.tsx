import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast-config";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

// CRITICAL: This component handles the magic link -> onboarding flow.
// DO NOT modify the redirection logic without thorough testing.
// Changes here can break the critical user onboarding process.
// The order of checks is important:
// 1. Check for session
// 2. Check for profile
// 3. Handle redirections based on current path

export const ProtectedRoute = ({ children, requireProfile = true }: ProtectedRouteProps) => {
  const { session, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const userId = session?.user?.id;
      const profileId = profile?.id;

      logger.info("Protected Route - Auth Check", {
        userId,
        profileId,
        isLoading,
        currentPath: location.pathname,
        requireProfile
      });

      // Wait for loading to complete before making any decisions
      if (isLoading) {
        return;
      }

      // STEP 1: Check Session
      if (!userId) {
        if (location.pathname !== '/auth') {
          logger.info("No session, redirecting to auth");
          navigate("/auth", { replace: true });
        }
        return;
      }

      // STEP 2: Check Profile
      // If we have a session but no profile, and profile is required
      if (userId && !profileId && requireProfile) {
        if (location.pathname !== '/onboarding') {
          logger.info("No profile found, redirecting to onboarding", { userId });
          navigate("/onboarding", { replace: true });
          showToast.info("Please complete your profile to continue");
          return;
        }
      }

      // STEP 3: Handle authenticated users with profiles
      if (userId && profileId) {
        if (location.pathname === '/auth' || location.pathname === '/onboarding') {
          logger.info("User already has profile, redirecting to home");
          navigate("/", { replace: true });
          return;
        }
      }
    };

    checkAuth();
  }, [session?.user?.id, profile?.id, isLoading, navigate, location.pathname, requireProfile]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show nothing while redirecting if no session/profile when required
  if (!session?.user?.id && requireProfile) {
    return null;
  }

  if (requireProfile && !profile?.id) {
    return null;
  }

  return <>{children}</>;
};