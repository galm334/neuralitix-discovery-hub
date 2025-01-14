import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface CategorySidebarProps {
  onFilterChange: (filters: any) => void;
}

export function CategorySidebar({ onFilterChange }: CategorySidebarProps) {
  return (
    <div className="space-y-6 sticky top-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search tools..." 
          className="pl-9"
        />
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
        {/* Add feature checkboxes here */}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Platforms</h3>
        {/* Add platform checkboxes here */}
      </div>
    </div>
  );
}