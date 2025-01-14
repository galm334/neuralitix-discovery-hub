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
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string' || query.length < 3) {
      return new Response(
        JSON.stringify({ suggestions: [], tools: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Original query:', query);

    // Check if the query starts with "writ"
    if (query.toLowerCase().startsWith('writ')) {
      // For "writ" related queries, we'll specifically search for writing tools
      const { data: tools, error: toolsError } = await supabaseClient
        .from('ai_tools')
        .select('name, description, category')
        .textSearch('search_vector', 'writing', {
          type: 'plain',
          config: 'english'
        })
        .limit(5);

      if (toolsError) {
        console.error('Database search error:', toolsError);
        throw toolsError;
      }

      console.log('Found tools:', tools?.length ?? 0);

      // If we found writing-related tools, suggest writing-specific queries
      if (tools && tools.length > 0) {
        const suggestions = [
          'I need an AI tool for writing blog posts',
          'Find AI tools for writing and content creation',
          'What are the best AI writing assistants?',
          'Compare AI tools for writing and editing',
        ];

        return new Response(
          JSON.stringify({ suggestions, tools }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // For other queries, use prefix matching
    const searchTerm = `${query.toLowerCase()}:*`;
    console.log('Formatted search term:', searchTerm);

    const { data: tools, error: toolsError } = await supabaseClient
      .from('ai_tools')
      .select('name, description, category')
      .textSearch('search_vector', searchTerm, {
        type: 'plain',
        config: 'english'
      })
      .limit(5);

    if (toolsError) {
      console.error('Database search error:', toolsError);
      throw toolsError;
    }

    console.log('Found tools:', tools?.length ?? 0);

    // Generate suggestions based on found tools
    let suggestions: string[] = [];
    if (tools && tools.length > 0) {
      const categories = [...new Set(tools.map(tool => tool.category))];
      suggestions = categories.map(category => `Find AI tools for ${category.toLowerCase()}`);
    }

    return new Response(
      JSON.stringify({ 
        suggestions, 
        tools: tools ?? [] 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400,
      }
    );
  }
});