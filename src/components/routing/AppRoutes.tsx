import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import Popular from "@/pages/Popular";
import Trending from "@/pages/Trending";
import JustAdded from "@/pages/JustAdded";
import ToolPage from "@/pages/ToolPage";
import CategoryPage from "@/pages/CategoryPage";
import Chat from "@/pages/Chat";
import StandaloneChat from "@/pages/StandaloneChat";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import GDPR from "@/pages/GDPR";
import { logger } from "@/utils/logger";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            logger.error("Profile check error:", error);
            return;
          }

          if (!profile) {
            setShouldRedirect('/onboarding');
          }
        } catch (error) {
          logger.error("Session check error:", error);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return null;
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/gdpr" element={<GDPR />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/standalone-chat" element={<StandaloneChat />} />
      <Route
        path="/"
        element={
          <RouteGuard>
            <Index />
          </RouteGuard>
        }
      />
      <Route
        path="/popular"
        element={
          <RouteGuard>
            <Popular />
          </RouteGuard>
        }
      />
      <Route
        path="/trending"
        element={
          <RouteGuard>
            <Trending />
          </RouteGuard>
        }
      />
      <Route
        path="/just-added"
        element={
          <RouteGuard>
            <JustAdded />
          </RouteGuard>
        }
      />
      <Route
        path="/tool/:toolId"
        element={
          <RouteGuard>
            <ToolPage />
          </RouteGuard>
        }
      />
      <Route
        path="/category/:category"
        element={
          <RouteGuard>
            <CategoryPage />
          </RouteGuard>
        }
      />
      <Route
        path="/chat/:conversationId"
        element={
          <RouteGuard>
            <Chat />
          </RouteGuard>
        }
      />
    </Routes>
  );
}