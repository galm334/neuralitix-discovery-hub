import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, isFollowUp = false } = await req.json();
    console.log('Processing query:', query, 'isFollowUp:', isFollowUp);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // For initial queries, do a direct database search
    if (!isFollowUp) {
      console.log('Performing direct database search');
      const { data: tools, error: searchError } = await supabase
        .from('ai_tools')
        .select('name, description, category')
        .textSearch('description', query)
        .limit(5);

      if (searchError) {
        console.error('Database search error:', searchError);
        throw searchError;
      }

      console.log('Found tools:', tools);

      let response = "";
      if (tools && tools.length > 0) {
        response = "Here are some AI tools that match your search:\n\n";
        tools.forEach(tool => {
          response += `### ${tool.name}\n`;
          response += `${tool.description}\n`;
          response += `Category: ${tool.category}\n\n`;
        });
        response += "\nWould you like to know more about any of these tools? Feel free to ask follow-up questions!";
      } else {
        response = "I couldn't find any exact matches in our database. Could you try rephrasing your search or being more specific about what kind of AI tool you're looking for?";
      }

      console.log('Sending response:', response);
      return new Response(
        JSON.stringify({ 
          message: response,
          tools: tools || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For follow-up questions, use OpenAI
    console.log('Processing follow-up question with AI');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
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
            content: 'You are a helpful AI assistant that helps users understand AI tools better. Provide detailed, informative responses to follow-up questions about AI tools.' 
          },
          { role: 'user', content: query }
        ],
      }),
    });

    const aiResponse = await response.json();
    console.log('AI Response:', aiResponse);

    return new Response(
      JSON.stringify({ 
        message: aiResponse.choices[0].message.content,
        tools: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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