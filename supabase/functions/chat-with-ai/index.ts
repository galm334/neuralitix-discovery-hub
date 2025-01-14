import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

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

    // Search for relevant tools in the database
    const { data: tools, error: searchError } = await supabase
      .from('ai_tools')
      .select('name, description, category')
      .textSearch('search_vector', query.replace(/[^\w\s]/g, ' '), {
        type: 'plain',
        config: 'english'
      });

    if (searchError) {
      console.error('Error searching tools:', searchError);
      throw searchError;
    }

    console.log('Found tools:', tools);

    let systemPrompt = `You are a helpful AI assistant that helps users find AI tools. You should always be friendly and conversational.

Format your response with clear sections:
1. If verified tools are found, list them under "## Verified Tools"
2. Then list web suggestions under "## Additional Suggestions"
3. For each tool (both verified and suggestions):
   - Use "### [Tool Name]" as a subheading
   - Write a clear paragraph for the description
   - List key features with bullet points
4. End with a friendly offer to help with more specific information

Current query: "${query}"

${tools && tools.length > 0 
  ? `Found these verified tools:\n${JSON.stringify(tools, null, 2)}`
  : 'No verified tools found in our database.'
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Please format the response with:
1. Verified tools section (if any found)
2. Additional suggestions section
3. Clear headings and paragraphs for each tool
4. Bullet points for features
5. A friendly closing note`
          }
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