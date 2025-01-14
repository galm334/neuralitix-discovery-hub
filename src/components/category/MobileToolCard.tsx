import { Bookmark, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Tool {
  title: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  saves: number;
  isVerified: boolean;
}

interface MobileToolCardProps {
  tool: Tool;
  index: number;
}

export function MobileToolCard({ tool, index }: MobileToolCardProps) {
  return (
    <div className="relative flex flex-col p-4 bg-[#F1F0FB]/30 first:rounded-t-lg last:rounded-b-lg">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-muted-foreground h-16 flex items-center">#{index + 1}</span>
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="flex-1">
          <Link 
            to={`/tool/${tool.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-primary transition-colors"
          >
            <h3 className="text-xl font-semibold">{tool.title}</h3>
          </Link>
        </div>
      </div>

      <div className="mt-4 space-y-3 w-full">
        <p className="text-sm text-muted-foreground">
          {tool.description}
        </p>
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
    </div>
  );
}