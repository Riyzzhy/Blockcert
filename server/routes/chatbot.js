import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Certificate platform knowledge base
const SYSTEM_PROMPT = `You are a helpful AI assistant for BlockCert, an advanced blockchain-based certificate verification platform. Your role is to help users with:

1. **Certificate Upload Process:**
   - Users can upload PDF, PNG, JPG, or JPEG certificate files (max 10MB)
   - The system analyzes certificates using AI to extract metadata
   - Certificates are stored securely on the blockchain for verification
   - Each certificate gets a unique blockchain hash for verification
   - Time-window security codes protect against replay attacks
   - Users can categorize uploads for Internship or Job applications

2. **Certificate Verification:**
   - Users can verify certificates using the blockchain hash
   - Verification shows authenticity, confidence level, and metadata
   - QR codes can be generated for easy verification sharing
   - Verification URLs can be shared publicly
   - Forward and backward security codes ensure authenticity

3. **Time-Window Security System:**
   - Forward and backward unique codes generated for each session
   - Codes are non-reusable and time-bound (30 minutes)
   - Prevents replay attacks and ensures authentic user sessions
   - Each upload requires valid security codes
   - Codes can be refreshed if needed

4. **Career Management Features:**
   - Toggle between Internship and Job application modes
   - Separate verification records for different career purposes
   - Skills and achievements tracking
   - Company and position details management
   - Duration tracking for internships

5. **File Formats Supported:**
   - PDF files (most common for certificates)
   - Image formats: PNG, JPG, JPEG
   - Maximum file size: 10MB
   - Files are processed and analyzed automatically

6. **Key Features:**
   - Dashboard to view all uploaded certificates
   - Download certificates in PDF, HTML, JSON, or original formats
   - Generate QR codes for verification
   - AI-powered certificate analysis with confidence scoring
   - Blockchain-based immutable storage
   - Career-specific filtering and management

7. **Security Features:**
   - Time-window forward and backward unique codes for each session
   - Codes are non-reusable and time-bound (30 minutes)
   - Prevents replay attacks and ensures authentic user sessions
   - Each upload requires valid security codes
   - Session tracking and monitoring

8. **Common Questions & Answers:**

**Q: "How do I upload a certificate?"**
A: 1. Go to Upload page → 2. Choose Internship/Job toggle → 3. Fill career details → 4. Enter certificate information → 5. Upload file → 6. Wait for AI analysis → 7. Save to dashboard

**Q: "What are forward & backward security codes?"**
A: These are advanced security features that prevent replay attacks. Each session generates unique forward and backward codes that are time-limited (30 minutes), non-reusable, and blockchain-verified before any operation.

**Q: "How do I apply my Internship/Job details for verification?"**
A: Use the career toggle on the upload page to select Internship or Job mode. Fill in position, company, dates, skills, and achievements. This creates separate verification records for different career purposes.

**Q: "How do I verify a certificate?"**
A: Go to Verify page → Enter the 64-character hash → Click Verify → View results showing authenticity, confidence level, and blockchain details.

Always be helpful, concise, and focus on practical guidance. Explain technical concepts in simple terms. If users ask about specific platform features, provide step-by-step instructions.`;

// Rate limiting (simple in-memory store)
const rateLimitStore = new Map();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimitStore.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return true;
};

// Free AI API Providers with enhanced error handling
class AIProviderManager {
  constructor() {
    this.providers = [
      {
        name: 'Groq',
        enabled: !!process.env.GROQ_API_KEY,
        priority: 1,
        call: this.callGroq.bind(this)
      },
      {
        name: 'Google AI Studio',
        enabled: !!process.env.GOOGLE_AI_API_KEY,
        priority: 2,
        call: this.callGoogleAI.bind(this)
      },
      {
        name: 'Hugging Face',
        enabled: !!process.env.HUGGINGFACE_API_KEY,
        priority: 3,
        call: this.callHuggingFace.bind(this)
      },
      {
        name: 'Together AI',
        enabled: !!process.env.TOGETHER_API_KEY,
        priority: 4,
        call: this.callTogetherAI.bind(this)
      },
      {
        name: 'Cohere',
        enabled: !!process.env.COHERE_API_KEY,
        priority: 5,
        call: this.callCohere.bind(this)
      }
    ];

    // Sort by priority
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  async callGroq(messages) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content;
  }

  async callGoogleAI(messages) {
    // Convert messages to Gemini format
    const userMessage = messages[messages.length - 1].content;
    const systemContext = messages.find(m => m.role === 'system')?.content || '';
    
    const prompt = systemContext ? `${systemContext}\n\nUser: ${userMessage}` : userMessage;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Google AI error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text;
  }

  async callHuggingFace(messages) {
    const userMessage = messages[messages.length - 1].content;
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: userMessage,
        parameters: {
          max_length: 800,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || data.generated_text;
  }

  async callTogetherAI(messages) {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content;
  }

  async callCohere(messages) {
    const userMessage = messages[messages.length - 1].content;
    const systemContext = messages.find(m => m.role === 'system')?.content || '';
    
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r',
        message: userMessage,
        preamble: systemContext,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  }

  async generateResponse(messages) {
    const enabledProviders = this.providers.filter(p => p.enabled);
    
    if (enabledProviders.length === 0) {
      throw new Error('No AI providers configured');
    }

    // Try providers in priority order until one succeeds
    for (const provider of enabledProviders) {
      try {
        console.log(`🤖 Trying ${provider.name}...`);
        const response = await provider.call(messages);
        if (response && response.trim()) {
          console.log(`✅ ${provider.name} succeeded`);
          return {
            content: response.trim(),
            provider: provider.name
          };
        }
      } catch (error) {
        console.log(`❌ ${provider.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }

  getStatus() {
    return this.providers.map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
      configured: p.enabled
    }));
  }
}

const aiManager = new AIProviderManager();

// POST /api/chatbot - Main chatbot endpoint
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({ 
        error: 'Message too long. Please keep messages under 2000 characters.' 
      });
    }

    // Rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait a moment before sending another message.' 
      });
    }

    // Check if any AI provider is configured
    const enabledProviders = aiManager.providers.filter(p => p.enabled);
    if (enabledProviders.length === 0) {
      return res.status(500).json({ 
        error: 'No AI providers configured. Please contact the administrator.' 
      });
    }

    // Prepare conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      // Include recent conversation history for context
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Try to get response from AI providers
    const result = await aiManager.generateResponse(messages);

    if (!result.content) {
      throw new Error('No response generated');
    }

    res.json({ 
      response: result.content,
      provider: result.provider,
      timestamp: new Date().toISOString(),
      providersAvailable: enabledProviders.length
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);

    // Handle specific errors
    if (error.message.includes('rate_limit') || error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'AI service is busy. Please wait a moment and try again.' 
      });
    }

    if (error.message.includes('No AI providers configured')) {
      return res.status(500).json({ 
        error: 'AI service configuration error. Please contact support.' 
      });
    }

    // Generic error response
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again or contact support if the problem persists.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/chatbot/health - Health check for chatbot service
router.get('/health', (req, res) => {
  const providerStatus = aiManager.getStatus();
  const hasEnabledProvider = providerStatus.some(p => p.enabled);
  
  res.json({ 
    status: hasEnabledProvider ? 'OK' : 'No providers configured',
    providers: providerStatus,
    timestamp: new Date().toISOString(),
    rateLimitInfo: {
      limit: RATE_LIMIT,
      window: RATE_WINDOW
    }
  });
});

// GET /api/chatbot/providers - Get available providers
router.get('/providers', (req, res) => {
  const providerStatus = aiManager.getStatus();
  res.json({
    providers: providerStatus,
    total: providerStatus.length,
    enabled: providerStatus.filter(p => p.enabled).length
  });
});

export default router;