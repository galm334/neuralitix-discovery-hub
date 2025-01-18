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

export function AppRoutes() {
  const [isLoading, setIsLoading] = useState(true);
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

          if (error) {
            logger.error("Profile check error:", error);
            setIsLoading(false);
            return;
          }

          if (!profile) {
            setShouldRedirect('/onboarding');
          }
        } catch (error) {
          logger.error("Session check error:", error);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/gdpr" element={<GDPR />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/standalone-chat" element={<StandaloneChat />} />
      <Route path="/" element={<Index />} />
      <Route path="/popular" element={<Popular />} />
      <Route path="/trending" element={<Trending />} />
      <Route path="/just-added" element={<JustAdded />} />
      <Route path="/tool/:toolId" element={<ToolPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/chat/:conversationId" element={<Chat />} />
    </Routes>
  );
}