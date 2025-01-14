import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Searching for query:', query)

    // Generate autocomplete suggestions based on the query
    const suggestions = [
      `I need an AI tool that can ${query}`,
      `I need an AI tool that can help me ${query}`,
      `I need an AI tool that will ${query}`,
      `I need an AI tool for ${query}`,
      `I need an AI tool to ${query}`
    ]

    // Search for relevant tools
    const { data: tools, error } = await supabaseClient
      .from('ai_tools')
      .select('name, description, category')
      .textSearch('search_vector', query)
      .limit(5)

    if (error) {
      console.error('Database search error:', error)
      throw error
    }

    console.log('Found tools:', tools?.length ?? 0)

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
    )
  } catch (error) {
    console.error('Function error:', error)
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
    )
  }
})