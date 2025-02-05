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

interface DesktopToolCardProps {
  tool: Tool;
  index: number;
}

export function DesktopToolCard({ tool, index }: DesktopToolCardProps) {
  return (
    <div className="relative flex flex-col p-4 bg-[#F1F0FB]/30 first:rounded-t-lg last:rounded-b-lg">
      <div className="flex items-start gap-4">
        <div className="text-2xl font-bold text-white mt-1">
          #{index + 1}
        </div>
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={tool.image}
            alt={tool.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link 
              to={`/tool/${tool.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
            </Link>
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
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-white line-clamp-2 max-w-[100ch]">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E5DEFF] text-sm text-white">
        <span>Score: {tool.rating}</span>
        <span>{tool.price}</span>
        <div className="flex items-center gap-1">
          <Bookmark className="w-4 h-4" />
          <span>{tool.saves.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}