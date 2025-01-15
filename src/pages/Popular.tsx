import { AIToolCard } from "@/components/AIToolCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const popularTools = [
  {
    title: "CodeReviewer AI",
    description: "Intelligent code review assistant that helps developers write better code.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    price: "$10/month",
    rating: 9.5,
    saves: 892,
    isVerified: true,
  },
  {
    title: "DataViz Assistant",
    description: "AI-powered data visualization tool for creating beautiful charts and graphs.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    price: "$15/month",
    rating: 9.5,
    saves: 567,
    isVerified: true,
  },
];

export default function Popular() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
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

  if (!session) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Popular AI Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularTools.map((tool) => (
          <AIToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}