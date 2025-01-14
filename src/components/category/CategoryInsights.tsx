import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryInsightsProps {
  category: string;
}

export function CategoryInsights({ category }: CategoryInsightsProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "user",
            content: `Generate comprehensive insights about ${category} tools with the following sections. Make it professional and informative:

            1. Overview of ${category} tools
            2. What Are Some Reasons To Use ${category} tools?
            3. Why Is ${category} tools Important?
            4. Features of ${category} tools
            5. Types of Users That Can Benefit From ${category} tools
            6. How Much Does ${category} tools Cost?
            7. Risks To Consider With ${category} tools
            8. ${category} tools Integrations
            9. What Are Some Questions To Ask When Considering ${category} tools?

            Format the response in Markdown with H2 headers.`
          }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      setInsights(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
    setIsLoading(false);
  };

  if (!insights) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter OpenAI API Key to generate insights</label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="max-w-md"
          />
        </div>
        <Button 
          onClick={generateInsights}
          disabled={!apiKey || isLoading}
        >
          {isLoading ? "Generating..." : "Generate Insights"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
    </div>
  );
}