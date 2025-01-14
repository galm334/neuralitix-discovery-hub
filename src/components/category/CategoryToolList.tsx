import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryToolListProps {
  category?: string;
  filters: {
    features: string[];
    platform: string[];
    pricing: string[];
  };
  sortBy?: string;
}

const tools = [
  {
    title: "CodeReviewer AI",
    description: "Advanced AI-powered code review tool that helps developers write better code faster. Features include real-time suggestions.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    price: "Free",
    rating: 9.8,
    saves: 1234,
    isVerified: true,
  },
  {
    title: "DataViz Assistant",
    description: "Intelligent data visualization platform that automatically generates beautiful charts and insights. Supports multiple data.",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    price: "$10/month",
    rating: 9.5,
    saves: 892,
    isVerified: true,
  },
];

export function CategoryToolList({ category, filters, sortBy = "rating" }: CategoryToolListProps) {
  const isMobile = useIsMobile();

  const sortedTools = [...tools].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "saves":
        return b.saves - a.saves;
      case "newest":
        return 0; // In real implementation, compare dates
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        {sortedTools.map((tool, index) => (
          <div key={tool.title} className="relative flex flex-col p-4 bg-[#F1F0FB]/30 first:rounded-t-lg last:rounded-b-lg">
            <div className="flex items-start gap-4 mb-4">
              {!isMobile && (
                <div className="text-2xl font-bold text-muted-foreground mt-1">
                  #{index + 1}
                </div>
              )}
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{tool.title}</h3>
                  {!isMobile && (
                    <div className="flex items-center gap-4">
                      <Link 
                        to={`/tool/${tool.title.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="text-primary hover:underline"
                      >
                        See more
                      </Link>
                      <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90" size="sm">
                        Try now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-[100ch] mb-4">
                  {tool.description}
                </p>
                {isMobile && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Score: {tool.rating}</span>
                      <span>{tool.price}</span>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        <span>{tool.saves.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90">
                      Try now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                    <Link 
                      to={`/tool/${tool.title.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="block text-center text-primary hover:underline"
                    >
                      Learn more
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {!isMobile && (
              <div className="flex items-center justify-between pt-4 border-t border-[#E5DEFF] text-sm text-muted-foreground">
                <span>Score: {tool.rating}</span>
                <span>{tool.price}</span>
                <div className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  <span>{tool.saves.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isMobile && (
        <div className="mt-12 prose prose-invert max-w-none">
          <h2>Category Insights</h2>
          <p>
            This category has shown significant growth over the past year, with a steady increase in both user adoption and feature innovation. 
            Tools in this space are increasingly focusing on AI-powered automation and seamless integration capabilities.
          </p>
          <h3>Market Trends</h3>
          <ul>
            <li>Growing demand for AI-powered automation features</li>
            <li>Increased focus on team collaboration capabilities</li>
            <li>Rising interest in cross-platform compatibility</li>
          </ul>
        </div>
      )}
    </div>
  );
}
