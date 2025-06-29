// Gemini AI integration for document verification and chatbot
export class GeminiAI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured. AI features will use mock responses.');
      console.log('💡 To enable AI features:');
      console.log('1. Get a Gemini API key from https://makersuite.google.com/app/apikey');
      console.log('2. Add VITE_GEMINI_API_KEY=your_key_here to your .env file');
      console.log('3. Restart the development server');
    }
  }

  private async makeRequest(contents: any[]) {
    try {
      // If no API key, return mock response
      if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
        console.log('🎭 Using mock AI response (Gemini API key not configured)');
        return this.getMockResponse(contents);
      }

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
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
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini AI request failed:', error);
      console.log('🎭 Falling back to mock response');
      return this.getMockResponse(contents);
    }
  }

  private getMockResponse(contents: any[]): string {
    const prompt = contents[0]?.parts?.[0]?.text || '';
    
    if (prompt.includes('government ID') || prompt.includes('government_id')) {
      return JSON.stringify({
        isValid: true,
        confidence: 0.85,
        documentType: "Government ID",
        extractedData: {
          name: "John Doe",
          idNumber: "XXXX-XXXX-1234",
          dateOfBirth: "1995-01-01",
          address: "123 Main St, City",
          issueDate: "2020-01-01",
          expiryDate: "2030-01-01"
        },
        securityFeatures: ["Hologram", "Watermark", "Digital signature"],
        concerns: [],
        details: "Mock verification: Government ID appears authentic with standard security features."
      });
    }
    
    if (prompt.includes('medical prescription') || prompt.includes('prescription')) {
      return JSON.stringify({
        isValid: true,
        confidence: 0.80,
        extractedData: {
          doctorName: "Dr. Smith",
          hospitalName: "City Hospital",
          patientName: "Patient Name",
          medications: ["Medicine A", "Medicine B"],
          dosages: ["10mg daily", "5mg twice daily"],
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          diagnosis: "Medical condition"
        },
        medicalValidity: {
          hasSignature: true,
          hasStamp: true,
          hasLetterhead: true,
          dateValid: true
        },
        concerns: [],
        details: "Mock verification: Medical prescription appears valid with proper medical formatting."
      });
    }
    
    if (prompt.includes('risk assessment') || prompt.includes('loan')) {
      return JSON.stringify({
        riskLevel: "medium",
        score: 65,
        recommendations: ["Verify borrower identity", "Check repayment history", "Consider loan purpose"],
        concerns: ["Limited credit history", "High loan amount relative to income"],
        positiveFactors: ["Verified user", "Clear loan purpose", "Reasonable interest rate"],
        analysis: "Mock analysis: Moderate risk loan with standard verification requirements."
      });
    }
    
    // Default chatbot response
    return "I'm currently running in demo mode with mock AI responses. To enable full Gemini AI features, please configure your API key in the .env file. How can I help you with Vibe today?";
  }

  // Convert file to base64 for image analysis
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Verify government ID documents
  async verifyGovernmentID(file: File): Promise<{
    isValid: boolean;
    confidence: number;
    extractedData: any;
    details: string;
  }> {
    try {
      const base64Image = await this.fileToBase64(file);
      const mimeType = file.type;

      const prompt = `
        Analyze this government ID document image and provide a detailed verification report for Vibe P2P lending platform.
        
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
        
        Be thorough but concise. Focus on authenticity verification for P2P lending security.
      `;

      const contents = [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ];

      const response = await this.makeRequest(contents);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        const result = JSON.parse(jsonMatch[0]);
        
        return {
          isValid: result.isValid || false,
          confidence: result.confidence || 0,
          extractedData: result.extractedData || {},
          details: result.details || 'Government ID analysis completed'
        };
      } catch (parseError) {
        const isValid = response.toLowerCase().includes('valid') && 
                        !response.toLowerCase().includes('invalid') &&
                        !response.toLowerCase().includes('fake');
        
        return {
          isValid,
          confidence: isValid ? 0.7 : 0.3,
          extractedData: {},
          details: response || 'Document analysis completed'
        };
      }
    } catch (error) {
      console.error('Government ID verification failed:', error);
      return {
        isValid: false,
        confidence: 0,
        extractedData: {},
        details: 'Verification failed due to technical error'
      };
    }
  }

  // Verify medical prescriptions
  async verifyMedicalPrescription(file: File): Promise<{
    isValid: boolean;
    confidence: number;
    extractedData: any;
    details: string;
  }> {
    try {
      const base64Image = await this.fileToBase64(file);
      const mimeType = file.type;

      const prompt = `
        Analyze this medical prescription image and verify its authenticity for Vibe P2P lending platform.
        
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
        
        Focus on medical authenticity and prescription validity for student medical loan verification.
      `;

      const contents = [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ];

      const response = await this.makeRequest(contents);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        const result = JSON.parse(jsonMatch[0]);
        
        return {
          isValid: result.isValid || false,
          confidence: result.confidence || 0,
          extractedData: result.extractedData || {},
          details: result.details || 'Medical prescription analysis completed'
        };
      } catch (parseError) {
        const isValid = response.toLowerCase().includes('prescription') && 
                        response.toLowerCase().includes('doctor') &&
                        !response.toLowerCase().includes('fake');
        
        return {
          isValid,
          confidence: isValid ? 0.6 : 0.2,
          extractedData: {},
          details: response || 'Prescription analysis completed'
        };
      }
    } catch (error) {
      console.error('Medical prescription verification failed:', error);
      return {
        isValid: false,
        confidence: 0,
        extractedData: {},
        details: 'Verification failed due to technical error'
      };
    }
  }

  // Chatbot conversation
  async chatWithBot(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      const systemPrompt = `
        You are Vibe AI Assistant, a helpful chatbot for Vibe - a peer-to-peer lending platform for students.
        
        Platform Info:
        - Name: Vibe
        - Tagline: "Lend, Borrow, Connect – Vibe!"
        - Purpose: P2P lending platform connecting students globally
        
        Your role:
        - Help users understand how P2P lending works on Vibe
        - Guide them through loan posting and funding processes
        - Explain verification requirements and AI-powered features
        - Provide information about interest rates, repayment terms
        - Assist with accessibility features and voice navigation
        - Answer questions about blockchain security and Algorand integration
        - Help with account verification and document upload
        - Explain Gemini AI verification features
        
        Guidelines:
        - Be friendly, helpful, and use "vibe" language naturally
        - Keep responses concise but informative
        - Always prioritize user safety and financial responsibility
        - Mention that P2P lending involves risks
        - Encourage users to read terms and conditions
        - Support multiple languages (English, Hindi, Hinglish, Bengali, Spanish, Chinese)
        - Be sensitive to financial difficulties students may face
        - Use encouraging language like "Let's vibe together" or "Ready to help you vibe"
        
        Platform features to mention:
        - Voice navigation for accessibility
        - Blockchain-secured transactions on Algorand
        - Gemini AI-powered document verification
        - Multi-language support
        - Medical prescription verification for medical loans
        - Government ID verification for security
        - Real-time risk assessment
        - 24/7 AI chatbot support
        
        Current conversation context: Student lending platform assistance on Vibe
      `;

      const contents = [
        {
          parts: [{ text: systemPrompt }]
        }
      ];

      conversationHistory.forEach(msg => {
        contents.push({
          parts: [{ text: `${msg.role}: ${msg.content}` }]
        });
      });

      contents.push({
        parts: [{ text: `User: ${message}` }]
      });

      const response = await this.makeRequest(contents);
      return response || "I'm sorry, I couldn't process your request right now. Please try again and let's keep the vibe going!";
    } catch (error) {
      console.error('Chatbot request failed:', error);
      return "I'm experiencing technical difficulties. Please try again later or contact our support team. Don't worry, we'll get back to vibing soon!";
    }
  }

  // Analyze loan request for risk assessment
  async analyzeLoanRisk(loanData: any, userProfile: any): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    score: number;
    recommendations: string[];
    concerns: string[];
  }> {
    try {
      const prompt = `
        Analyze this loan request for risk assessment on Vibe P2P lending platform:
        
        Loan Details:
        - Amount: ${loanData.amount}
        - Purpose: ${loanData.purpose}
        - Interest Rate: ${loanData.interestRate}%
        - Tenure: ${loanData.tenureDays} days
        - Description: ${loanData.description}
        
        User Profile:
        - Verified: ${userProfile?.isVerified || false}
        - Previous Loans: ${userProfile?.stats?.totalLoansTaken || 0}
        - Successful Repayments: ${userProfile?.stats?.successfulRepayments || 0}
        - Average Rating: ${userProfile?.stats?.averageRating || 0}
        
        Provide risk assessment in JSON format:
        {
          "riskLevel": "low|medium|high",
          "score": number (0-100),
          "recommendations": ["list of recommendations for lenders"],
          "concerns": ["list of potential concerns"],
          "positiveFactors": ["list of positive factors"],
          "analysis": "detailed risk analysis"
        }
        
        Consider this is for student lending on Vibe platform.
      `;

      const contents = [
        {
          parts: [{ text: prompt }]
        }
      ];

      const response = await this.makeRequest(contents);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        const result = JSON.parse(jsonMatch[0]);
        
        return {
          riskLevel: result.riskLevel || 'medium',
          score: result.score || 50,
          recommendations: result.recommendations || [],
          concerns: result.concerns || []
        };
      } catch (parseError) {
        return {
          riskLevel: 'medium',
          score: 50,
          recommendations: ['Verify borrower identity', 'Check repayment history'],
          concerns: ['Limited data available for assessment']
        };
      }
    } catch (error) {
      console.error('Risk analysis failed:', error);
      return {
        riskLevel: 'high',
        score: 30,
        recommendations: ['Exercise caution', 'Request additional verification'],
        concerns: ['Unable to complete risk analysis']
      };
    }
  }
}

export const geminiAI = new GeminiAI();