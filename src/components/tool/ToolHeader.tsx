import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Bookmark, Link2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolHeaderProps {
  title: string;
  logoUrl: string;
  category: string;
  dateAdded: string;
  authorName: string;
  authorAgentsCount: number;
  authorImageUrl: string;
  description: string;
  rating: number;
  saves: number;
}

export function ToolHeader({
  title,
  logoUrl,
  category,
  dateAdded,
  authorName,
  authorAgentsCount,
  authorImageUrl,
  description,
  rating,
  saves
}: ToolHeaderProps) {
  const isMobile = useIsMobile();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Category and Date */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Badge variant="secondary">{category}</Badge>
        <span>Added {dateAdded}</span>
      </div>

      {/* Title Row with Logo */}
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={logoUrl}
          alt={`${title} Logo`}
          className="w-8 h-8 rounded-lg object-cover"
        />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      {/* Author and Description */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src={authorImageUrl}
            alt={authorName}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm">{authorName}</span>
          <span className="text-sm text-muted-foreground">• {authorAgentsCount.toLocaleString()} agents</span>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* CTA Button (Mobile) */}
      {isMobile && (
        <Button size="lg" className="w-full">
          Visit Agent
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )}

      {/* Stats and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold">{rating}</span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            <span className="hidden md:inline">{saves.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {!isMobile && (
            <Button size="lg">
              Visit Agent
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Link2 className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Copy link</span>}
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Save</span>}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Share</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}