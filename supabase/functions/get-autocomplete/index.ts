import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common writing-related terms and their corrections
const commonTerms = {
  'writ': 'writing',
  'blog': 'blogging',
  'edit': 'editing',
  'content': 'content creation',
  'copy': 'copywriting',
  'market': 'marketing',
  'trans': 'translation',
  'summar': 'summarization',
  'proof': 'proofreading',
  'ai': 'artificial intelligence',
  'chat': 'chatbot',
  'gen': 'generation',
  'anal': 'analysis',
  'vis': 'visualization',
  'auto': 'automation',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Original query:', query);

    // Correct any partial or misspelled words
    const words = query.toLowerCase().split(' ');
    const correctedWords = words.map(word => {
      for (const [partial, full] of Object.entries(commonTerms)) {
        if (word.startsWith(partial)) {
          return full;
        }
      }
      return word;
    });

    const correctedQuery = correctedWords.join(' ');
    console.log('Corrected query:', correctedQuery);

    // Format the query for text search
    const searchTerms = correctedQuery
      .split(' ')
      .filter(word => word.length > 2)
      .join(' & ');

    console.log('Search terms:', searchTerms);

    // Search for relevant tools
    const { data: tools, error: toolsError } = await supabaseClient
      .from('ai_tools')
      .select('name, description, category')
      .textSearch('search_vector', searchTerms)
      .limit(5);

    if (toolsError) {
      console.error('Database search error:', toolsError);
      throw toolsError;
    }

    console.log('Found tools:', tools?.length ?? 0);

    // Generate suggestions based on the corrected query only
    const suggestions = [
      `Find AI tools for ${correctedQuery}`,
      `Search for AI ${correctedQuery} assistants`,
      `Discover AI tools for ${correctedQuery}`,
      `Compare AI ${correctedQuery} tools`,
      `Find best AI tools for ${correctedQuery}`
    ].filter(suggestion => 
      // Only include suggestions that use the corrected words
      !suggestion.includes(query.toLowerCase()) && 
      suggestion.includes(correctedQuery)
    );

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