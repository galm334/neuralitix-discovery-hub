import { AIToolCard } from "@/components/AIToolCard";

interface CategoryToolListProps {
  category?: string;
  filters: {
    features: string[];
    platform: string[];
    pricing: string[];
  };
  sortBy?: string;
}

// Mock data - replace with real data from your backend
const tools = [
  {
    title: "CodeReviewer AI",
    description: "Advanced AI-powered code review tool that helps developers write better code faster. Features include real-time suggestions, security scanning, and performance optimization tips.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    price: "Free",
    rating: 9.8,
    saves: 1234,
    isVerified: true,
  },
  {
    title: "DataViz Assistant",
    description: "Intelligent data visualization platform that automatically generates beautiful charts and insights. Supports multiple data sources and real-time collaboration.",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    price: "$10/month",
    rating: 9.5,
    saves: 892,
    isVerified: true,
  },
];

export function CategoryToolList({ category, filters, sortBy = "rating" }: CategoryToolListProps) {
  // Sort tools based on the selected criteria
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
      <div className="space-y-6">
        {sortedTools.map((tool, index) => (
          <div key={tool.title} className="relative flex items-start gap-4 p-4 rounded-lg border-2 border-[#9b87f5]/20 hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-muted-foreground mt-4">
              #{index + 1}
            </div>
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={tool.image}
                alt={tool.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}