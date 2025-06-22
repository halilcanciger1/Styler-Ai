import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { model_image, garment_image, category, seed, samples, quality } = await req.json()

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user credits
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabaseClient
      .from('generations')
      .insert({
        user_id: user.id,
        model_image_url: model_image,
        garment_image_url: garment_image,
        category,
        seed,
        samples: samples || 1,
        quality: quality || 'balanced',
        status: 'processing',
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Simulate AI processing (replace with actual API call)
    const processingTime = quality === 'performance' ? 3000 : quality === 'balanced' ? 5000 : 8000
    
    // In a real implementation, you would:
    // 1. Call the actual fashion AI API
    // 2. Handle the response
    // 3. Upload results to storage
    // 4. Update the generation record

    // For demo purposes, simulate processing
    setTimeout(async () => {
      try {
        // Mock result URLs (replace with actual generated images)
        const mockResults = Array.from({ length: samples || 1 }, (_, i) => 
          `https://images.pexels.com/photos/${1536619 + i}/pexels-photo-${1536619 + i}.jpeg`
        )

        // Update generation with results
        await supabaseClient
          .from('generations')
          .update({
            status: 'completed',
            result_urls: mockResults,
            processing_time: processingTime,
          })
          .eq('id', generation.id)

        // Deduct credits
        await supabaseClient
          .from('profiles')
          .update({ credits: profile.credits - 1 })
          .eq('id', user.id)

      } catch (error) {
        // Update generation with error status
        await supabaseClient
          .from('generations')
          .update({ status: 'failed' })
          .eq('id', generation.id)
      }
    }, processingTime)

    return new Response(
      JSON.stringify({ 
        id: generation.id,
        status: 'processing',
        estimated_time: processingTime / 1000
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})