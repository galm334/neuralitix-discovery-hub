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

    // First, search for relevant tools in the database
    const { data: tools, error: searchError } = await supabase
      .from('ai_tools')
      .select('name, description, category')
      .textSearch('search_vector', query.replace(/[^\w\s]/g, ' '), {
        type: 'plain',
        config: 'english'
      })
      .limit(3);

    if (searchError) {
      console.error('Error searching tools:', searchError);
      throw searchError;
    }

    console.log('Found tools:', tools);

    let systemPrompt = `You are a helpful AI assistant that helps users find AI tools. You should always be friendly and conversational.

Your responses should be well-formatted and easy to read. When suggesting tools, use clear sections and bullet points.

Current context: The user is looking for AI tools and has asked: "${query}"`;

    let assistantMessage = '';
    
    if (tools && tools.length > 0) {
      systemPrompt += `\n\nI found these relevant tools in our verified database:\n${JSON.stringify(tools, null, 2)}`;
      assistantMessage = "Based on your request, I found some verified AI tools that might help. Let me tell you about them:";
    } else {
      systemPrompt += "\n\nI couldn't find any verified tools in our database for this specific request.";
      assistantMessage = "I searched our verified database but couldn't find exact matches for your request. Would you like me to suggest some tools from the wider web? While these wouldn't be verified by our team yet, they might still be helpful. Just let me know if you'd like to explore those options.";
    }

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
          { role: 'assistant', content: assistantMessage },
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error from OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: aiResponse,
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