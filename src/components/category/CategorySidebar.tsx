import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategorySidebarProps {
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  isMobile?: boolean;
}

export function CategorySidebar({ onFilterChange, onSortChange, isMobile }: CategorySidebarProps) {
  return (
    <div className="space-y-6">
      {!isMobile && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tools..." 
            className="pl-9"
          />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Sort By</h3>
        <Select onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="saves">Most Saved</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Pricing</h3>
        <RadioGroup defaultValue="all" onValueChange={(value) => onFilterChange({ pricing: [value] })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="freemium" id="freemium" />
            <Label htmlFor="freemium">Freemium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid">Paid</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Features</h3>
        <div className="space-y-2">
          {["API Access", "Mobile App", "Chrome Extension", "Team Collaboration", "Custom Workflows"].map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox 
                id={feature} 
                onCheckedChange={(checked) => 
                  onFilterChange({ features: checked ? [feature] : [] })
                }
              />
              <Label htmlFor={feature}>{feature}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Platforms</h3>
        <div className="space-y-2">
          {["Web", "iOS", "Android", "Windows", "Mac", "Linux"].map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox 
                id={platform}
                onCheckedChange={(checked) => 
                  onFilterChange({ platform: checked ? [platform] : [] })
                }
              />
              <Label htmlFor={platform}>{platform}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}