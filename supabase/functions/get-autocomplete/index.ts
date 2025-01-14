import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Searching for query:', query);

    // Common writing-related terms to complete partial words
    const commonTerms = {
      'writ': 'writing',
      'blog': 'blogging',
      'edit': 'editing',
      'content': 'content',
      'copy': 'copywriting',
      'market': 'marketing',
      'trans': 'translation',
      'summar': 'summarization',
      'proof': 'proofreading',
    };

    // Find the matching term for the partial word
    let searchTerm = query.toLowerCase();
    for (const [partial, full] of Object.entries(commonTerms)) {
      if (query.toLowerCase().startsWith(partial)) {
        searchTerm = full;
        break;
      }
    }

    // Format the query for text search
    const formattedQuery = searchTerm
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
      .join(' & ');

    // Search for relevant tools
    const { data: tools, error: toolsError } = await supabaseClient
      .from('ai_tools')
      .select('name, description, category')
      .textSearch('search_vector', formattedQuery)
      .limit(5);

    if (toolsError) {
      console.error('Database search error:', toolsError);
      throw toolsError;
    }

    console.log('Found tools:', tools?.length ?? 0);

    // Generate complete, natural suggestions based on the completed search term
    const suggestions = [
      `Find AI tools for ${searchTerm}`,
      `Search for AI ${searchTerm} assistants`,
      `Discover AI tools for ${searchTerm}`,
      `Compare AI ${searchTerm} tools`,
      `Find best AI tools for ${searchTerm}`
    ];

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