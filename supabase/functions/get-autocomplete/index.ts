import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

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

    if (error) throw error

    return new Response(
      JSON.stringify({ suggestions, tools }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})