import { Routes, Route } from "react-router-dom";
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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/gdpr" element={<GDPR />} />
      <Route path="/standalone-chat" element={<StandaloneChat />} />
      <Route path="/" element={<Index />} />
      <Route path="/popular" element={<Popular />} />
      <Route path="/trending" element={<Trending />} />
      <Route path="/just-added" element={<JustAdded />} />
      <Route path="/tool/:toolId" element={<ToolPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/chat/:conversationId" element={<Chat />} />
    </Routes>
  );
}