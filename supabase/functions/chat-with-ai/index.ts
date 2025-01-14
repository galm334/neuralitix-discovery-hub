import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting chat-with-ai function');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { query } = await req.json();
    console.log('Received query:', query);

    if (!query) {
      throw new Error('No query provided');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Generating embedding for query...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      console.error('OpenAI Embedding API error:', error);
      throw new Error('Failed to generate embedding');
    }

    const { data: embeddingData } = await embeddingResponse.json();
    console.log('Embedding generated successfully');
    const embedding = embeddingData[0].embedding;

    console.log('Searching for similar tools...');
    const { data: tools, error: searchError } = await supabase.rpc('match_tools', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5
    });

    if (searchError) {
      console.error('Error in vector search:', searchError);
      throw searchError;
    }

    console.log('Found similar tools:', tools);

    const systemPrompt = `You are a helpful AI assistant that helps users find AI tools. You should always be friendly and conversational.
    Format your response like this:
    1. Start with a brief greeting
    2. If we found verified tools, list them under "## Verified Tools"
    3. Then list web suggestions under "## Additional Suggestions"
    4. For each tool:
       - Use "### [Tool Name]" as heading
       - Write a clear description paragraph
       - List key features with bullet points
    5. End with a friendly closing note
    
    Here are the tools I found in our database:
    ${JSON.stringify(tools, null, 2)}`;

    console.log('Generating AI response...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('OpenAI Chat API error:', responseText);
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    console.log('Generated response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('AI response is empty or malformed');
    }

    return new Response(
      JSON.stringify({ 
        message: data.choices[0].message.content,
        tools: tools || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});