import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Bookmark, Send } from "lucide-react";

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
  return (
    <div className="flex flex-col space-y-6">
      {/* Share button */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Category and Date */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Badge variant="secondary">{category}</Badge>
        <span>Added {dateAdded}</span>
      </div>

      {/* Title Row with Logo and CTA */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl}
            alt={`${title} Logo`}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <Button size="lg" className="shrink-0">
          Visit Agent
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
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

      {/* Stats and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">{rating}</span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            <span>{saves.toLocaleString()} saves</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}