import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
    return new Response(JSON.stringify({ insights: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});