import { CheckCircle2, X } from "lucide-react";

interface ToolProsAndConsProps {
  pros: string[];
  cons: string[];
}

export function ToolProsAndCons({ pros, cons }: ToolProsAndConsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-green-500">Pros</h2>
        <ul className="space-y-3">
          {pros.map((pro) => (
            <li key={pro} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-red-500">Cons</h2>
        <ul className="space-y-3">
          {cons.map((con) => (
            <li key={con} className="flex items-start gap-2">
              <X className="h-5 w-5 text-red-500 mt-0.5" />
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}