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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)

    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { documentType, imageData } = await req.json()

    // In a real implementation, this would:
    // 1. Call Google Vision API or similar OCR service
    // 2. Extract text and validate document format
    // 3. Check against government databases (where legally possible)
    // 4. Use AI models to detect fraud/tampering

    // Mock verification logic
    let verificationResult = {
      isValid: false,
      confidence: 0,
      extractedData: {},
      details: ''
    }

    if (documentType === 'government_id') {
      // Simulate government ID verification
      verificationResult = {
        isValid: Math.random() > 0.2, // 80% success rate for demo
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        extractedData: {
          name: 'John Doe',
          idNumber: 'XXXX-XXXX-1234',
          documentType: 'Aadhaar Card',
          issueDate: '2020-01-01'
        },
        details: 'Government ID verified successfully'
      }
    } else if (documentType === 'medical_prescription') {
      // Simulate medical prescription verification using Gemini Vision API
      verificationResult = {
        isValid: Math.random() > 0.3, // 70% success rate for demo
        confidence: Math.random() * 0.4 + 0.6, // 60-100%
        extractedData: {
          doctorName: 'Dr. Smith',
          hospitalName: 'City Hospital',
          medications: ['Medicine A', 'Medicine B'],
          date: new Date().toISOString().split('T')[0],
          patientName: 'Patient Name'
        },
        details: 'Medical prescription verified successfully'
      }
    }

    // Store verification result in database
    if (verificationResult.isValid) {
      await supabase.from('document_verifications').insert({
        user_id: user.user.id,
        document_type: documentType,
        verification_status: 'verified',
        confidence_score: verificationResult.confidence,
        extracted_data: verificationResult.extractedData,
        verified_at: new Date().toISOString()
      })
    }

    return new Response(
      JSON.stringify(verificationResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})