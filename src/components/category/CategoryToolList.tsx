import { useIsMobile } from "@/hooks/use-mobile";
import { MobileToolCard } from "./MobileToolCard";
import { DesktopToolCard } from "./DesktopToolCard";

interface CategoryToolListProps {
  category?: string;
  filters: {
    features: string[];
    platform: string[];
    pricing: string[];
  };
  sortBy?: string;
}

interface Tool {
  title: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  saves: number;
  isVerified: boolean;
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
          isMobile ? (
            <MobileToolCard key={tool.title} tool={tool} index={index} />
          ) : (
            <DesktopToolCard key={tool.title} tool={tool} index={index} />
          )
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