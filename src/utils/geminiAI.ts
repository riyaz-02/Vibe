// Gemini AI integration for document verification and chatbot
export class GeminiAI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'AIzaSyDY9LmQFvpnbkKaqPPTG4rMADtcWM78dWE';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  private async makeRequest(contents: any[]) {
    try {
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
      throw error;
    }
  }

  // Convert file to base64 for image analysis
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
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
        // Clean the response to extract JSON
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
        // Fallback if JSON parsing fails
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

      // Build conversation history
      const contents = [
        {
          parts: [{ text: systemPrompt }]
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        contents.push({
          parts: [{ text: `${msg.role}: ${msg.content}` }]
        });
      });

      // Add current message
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