import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Received query:', query);

    // Extract key terms from the query for search
    const searchTerms = query.toLowerCase()
      .replace(/i need|an|ai|tool|for|that|can/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    
    console.log('Extracted search terms:', searchTerms);

    // Build dynamic search conditions
    const searchConditions = searchTerms.map(term => 
      `category.ilike.%${term}%,description.ilike.%${term}%,name.ilike.%${term}%`
    ).join(',');

    // First try direct search using extracted terms
    let { data: tools, error: searchError } = await supabase
      .from('ai_tools')
      .select('*')
      .or(searchConditions);

    if (searchError) {
      console.error('Error in search:', searchError);
      throw searchError;
    }

    // If no results, try full text search
    if (!tools || tools.length === 0) {
      console.log('No direct matches found, trying full text search');
      const { data: textSearchTools, error: textSearchError } = await supabase
        .from('ai_tools')
        .select('*')
        .textSearch('search_vector', searchTerms.join(' '), {
          type: 'plain',
          config: 'english'
        });

      if (textSearchError) {
        console.error('Error in text search:', textSearchError);
        throw textSearchError;
      }

      tools = textSearchTools;
    }

    console.log('Found tools:', tools);

    const systemPrompt = `You are a helpful AI assistant that helps users find AI tools. You should always be friendly and conversational.

Your task is to help the user find AI tools for "${query}".

${tools && tools.length > 0 
  ? `I found these tools in our database:\n${JSON.stringify(tools, null, 2)}`
  : 'No exact matches found in our database, but I can suggest some popular alternatives.'}

Please format your response like this:
1. Start with a brief greeting
2. If we found verified tools, list them under "## Verified Tools"
3. Then list web suggestions under "## Additional Suggestions"
4. For each tool:
   - Use "### [Tool Name]" as heading
   - Write a clear description paragraph
   - List key features with bullet points
5. End with a friendly closing note`;

    console.log('Using system prompt:', systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Error from OpenAI API');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    return new Response(JSON.stringify({ 
      message: data.choices[0].message.content,
      tools: tools || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});