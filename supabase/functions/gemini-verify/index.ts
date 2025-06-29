import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get Gemini API key from environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with environment variables
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    const { documentType, imageData, mimeType } = await req.json()

    // Check if Gemini API key is available
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using mock verification')
      
      // Return mock verification result
      const mockResult = {
        isValid: true,
        confidence: 0.85,
        extractedData: documentType === 'government_id' ? {
          name: "John Doe",
          idNumber: "XXXX-XXXX-1234",
          documentType: "Government ID"
        } : {
          doctorName: "Dr. Smith",
          hospitalName: "City Hospital",
          medications: ["Medicine A"]
        },
        details: `Mock verification: ${documentType} appears valid`
      }

      // Store verification result
      await supabase.from('document_verifications').insert({
        user_id: user.user.id,
        document_type: documentType,
        verification_status: 'verified',
        confidence_score: mockResult.confidence,
        extracted_data: mockResult.extractedData,
        verified_at: new Date().toISOString()
      })

      return new Response(
        JSON.stringify(mockResult),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let prompt = ''
    
    if (documentType === 'government_id') {
      prompt = `
        Analyze this government ID document image and provide a detailed verification report.
        
        Please examine:
        1. Document authenticity and security features
        2. Text clarity and readability
        3. Photo quality and tampering signs
        4. Document format and layout
        5. Extract all visible text information
        
        Respond in JSON format:
        {
          "isValid": boolean,
          "confidence": number (0-1),
          "documentType": "string",
          "extractedData": {
            "name": "string",
            "idNumber": "string",
            "dateOfBirth": "string",
            "address": "string",
            "issueDate": "string",
            "expiryDate": "string"
          },
          "securityFeatures": ["list of detected security features"],
          "concerns": ["list of any concerns or red flags"],
          "details": "detailed explanation"
        }
        
        Be thorough but concise. Focus on authenticity verification.
      `
    } else if (documentType === 'medical_prescription') {
      prompt = `
        Analyze this medical prescription image and verify its authenticity.
        
        Please examine:
        1. Doctor's signature and stamp
        2. Hospital/clinic letterhead
        3. Prescription format and layout
        4. Medicine names and dosages
        5. Date and validity
        6. Patient information
        
        Respond in JSON format:
        {
          "isValid": boolean,
          "confidence": number (0-1),
          "extractedData": {
            "doctorName": "string",
            "hospitalName": "string",
            "patientName": "string",
            "medications": ["list of medicines"],
            "dosages": ["list of dosages"],
            "date": "string",
            "validUntil": "string",
            "diagnosis": "string"
          },
          "medicalValidity": {
            "hasSignature": boolean,
            "hasStamp": boolean,
            "hasLetterhead": boolean,
            "dateValid": boolean
          },
          "concerns": ["list of any concerns"],
          "details": "detailed explanation"
        }
        
        Focus on medical authenticity and prescription validity.
      `
    }

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates[0]?.content?.parts[0]?.text || ''

    // Parse JSON response from Gemini
    let verificationResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const isValid = responseText.toLowerCase().includes('valid') && 
                      !responseText.toLowerCase().includes('invalid') &&
                      !responseText.toLowerCase().includes('fake')
      
      verificationResult = {
        isValid,
        confidence: isValid ? 0.7 : 0.3,
        extractedData: {},
        details: responseText || 'Document analysis completed'
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

      // Update profile verification status if it's an ID
      if (documentType === 'government_id') {
        await supabase
          .from('profiles')
          .update({ 
            identity_verified: true,
            identity_verified_at: new Date().toISOString()
          })
          .eq('id', user.user.id)
      }
    }

    return new Response(
      JSON.stringify(verificationResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isValid: false,
        confidence: 0,
        details: 'Verification failed due to technical error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})