import { Button } from "@/components/ui/button";
import { ExternalLink, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Update {
  title: string;
  date: string;
  description: string;
}

interface ToolUpdatesProps {
  updates: Update[];
}

export function ToolUpdates({ updates }: ToolUpdatesProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Updates</h2>
        {!isMobile && (
          <Button variant="outline">
            Add Update
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {updates.map((update) => (
        <div key={update.title} className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{update.title}</h3>
            <span className="text-sm text-muted-foreground">{update.date}</span>
          </div>
          <p className="text-muted-foreground">{update.description}</p>
        </div>
      ))}
      <Button variant="outline" className="w-full">
        Read more updates
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}