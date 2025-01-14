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

    // Format search terms for prefix matching
    const searchTerm = `${query.toLowerCase()}:*`;

    console.log('Formatted search term:', searchTerm);

    // Search for relevant tools using prefix matching
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

    // Generate suggestions based on matching tools
    let suggestions: string[] = [];
    if (tools && tools.length > 0) {
      // Get unique categories and create category-based suggestions
      const categories = [...new Set(tools.map(tool => tool.category))];
      
      // Create suggestions based on the found categories
      suggestions = [
        'Find AI tools for writing',
        ...categories.map(category => `Find ${category} AI tools`),
        'Compare AI tools for writing',
      ];
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