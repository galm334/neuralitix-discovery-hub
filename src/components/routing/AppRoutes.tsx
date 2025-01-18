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
import { useAuth } from "@/contexts/AuthContext";

export function AppRoutes() {
  const { session, profile, isLoading } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) {
        setIsCheckingProfile(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (error) {
          logger.error("Profile check error:", error);
        }

        if (!profile && window.location.pathname !== '/onboarding') {
          window.location.href = '/onboarding';
        }
      } catch (error) {
        logger.error("Profile check failed:", error);
      }
      
      setIsCheckingProfile(false);
    };

    checkProfile();
  }, [session]);

  if (isLoading || isCheckingProfile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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