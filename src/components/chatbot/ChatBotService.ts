interface ChatResponse {
  content: string;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: 'navigate' | 'message' | 'external';
  value: string;
  icon?: string;
}

export class ChatBotService {
  private static instance: ChatBotService;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  static getInstance(): ChatBotService {
    if (!ChatBotService.instance) {
      ChatBotService.instance = new ChatBotService();
    }
    return ChatBotService.instance;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    // Add user message to history
    this.conversationHistory.push({ role: 'user', content: message });

    try {
      // Try to call the backend chatbot API
      const response = await fetch(`${this.baseUrl}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory.slice(-6) // Keep last 6 messages for context
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.conversationHistory.push({ role: 'assistant', content: data.response });
        
        return {
          content: data.response,
          quickActions: this.generateQuickActions(message, data.response)
        };
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.log('Backend chatbot not available, using local responses');
      
      // Fallback to local responses
      const localResponse = this.generateLocalResponse(message);
      this.conversationHistory.push({ role: 'assistant', content: localResponse.content });
      
      return localResponse;
    }
  }

  private generateQuickActions(userMessage: string, botResponse: string): QuickAction[] {
    const message = userMessage.toLowerCase();
    const response = botResponse.toLowerCase();

    // Security-related actions
    if (message.includes('security') || message.includes('codes') || response.includes('security')) {
      return [
        { label: 'Upload with Security', action: 'navigate', value: '/upload' },
        { label: 'How Security Works', action: 'message', value: 'Explain blockchain security features' }
      ];
    }

    // Career-related actions
    if (message.includes('internship') || message.includes('job') || message.includes('career')) {
      return [
        { label: 'Upload for Internship', action: 'navigate', value: '/upload' },
        { label: 'Upload for Job', action: 'navigate', value: '/upload' },
        { label: 'Career Features', action: 'message', value: 'Tell me about internship and job features' }
      ];
    }

    // Generate contextual quick actions based on the conversation
    if (message.includes('upload') || response.includes('upload')) {
      return [
        { label: 'Upload Certificate', action: 'navigate', value: '/upload' },
        { label: 'File Requirements', action: 'message', value: 'What file formats do you support?' }
      ];
    }

    if (message.includes('verify') || response.includes('verify')) {
      return [
        { label: 'Verify Hash', action: 'navigate', value: '/verify' },
        { label: 'How Verification Works', action: 'message', value: 'Explain verification process' }
      ];
    }

    if (message.includes('dashboard') || response.includes('dashboard')) {
      return [
        { label: 'Open Dashboard', action: 'navigate', value: '/dashboard' },
        { label: 'Download Options', action: 'message', value: 'What download formats are available?' }
      ];
    }

    // Default navigation actions
    return [
      { label: 'Upload Certificate', action: 'navigate', value: '/upload' },
      { label: 'Verify Document', action: 'navigate', value: '/verify' },
      { label: 'View Dashboard', action: 'navigate', value: '/dashboard' },
      { label: 'Learn More', action: 'external', value: '#about' }
    ];
  }

  private generateLocalResponse(message: string): ChatResponse {
    const msg = message.toLowerCase();

    // Security codes explanation
    if (msg.includes('security') || msg.includes('forward') || msg.includes('backward') || msg.includes('codes')) {
      return {
        content: "🔒 **Security Codes System:**\n\n**Forward & Backward Codes** are advanced security features that:\n\n• **Prevent Replay Attacks** - Each code is single-use only\n• **Time-Limited** - Expire after 30 minutes\n• **Session-Unique** - Generated per browser session\n• **Blockchain-Verified** - Validated before any operation\n\n**How it works:**\n1. Codes are auto-generated when you visit upload page\n2. They're embedded in your verification process\n3. Blockchain validates codes before storing certificates\n4. Used codes become invalid immediately\n\nThis ensures maximum security for your academic documents!",
        quickActions: [
          { label: 'See Security in Action', action: 'navigate', value: '/upload' },
          { label: 'Blockchain Security', action: 'message', value: 'Tell me about blockchain security' }
        ]
      };
    }

    // Career/Internship/Job features
    if (msg.includes('internship') || msg.includes('job') || msg.includes('career') || msg.includes('apply')) {
      return {
        content: "💼 **Career Application System:**\n\n**Internship Mode:**\n• Upload certificates for internship applications\n• Track position, company, and duration\n• Manage project details and achievements\n\n**Job Mode:**\n• Upload certificates for job applications\n• Professional experience tracking\n• Skills and accomplishments management\n\n**How to use:**\n1. Go to Upload page\n2. Use the toggle to select Internship or Job\n3. Fill in career-specific details\n4. Upload your certificate\n5. Get verified credentials for applications!\n\nBoth modes use the same security and blockchain verification!",
        quickActions: [
          { label: 'Upload for Internship', action: 'navigate', value: '/upload' },
          { label: 'Upload for Job', action: 'navigate', value: '/upload' },
          { label: 'View Applications', action: 'navigate', value: '/dashboard' }
        ]
      };
    }

    // Upload related
    if (msg.includes('upload') || msg.includes('add certificate')) {
      return {
        content: "📤 **How to Upload a Certificate:**\n\n1. **Go to Upload Page** - Click 'Upload' in navigation\n2. **Choose Career Type** - Toggle between Internship/Job\n3. **Fill Details** - Enter certificate and career information\n4. **Security Codes** - Auto-generated for protection\n5. **Upload File** - Drag & drop or click to select\n6. **AI Analysis** - Wait for verification results\n7. **Save to Dashboard** - Store verified certificate\n\n**Supported formats:** PDF, PNG, JPG, JPEG (max 10MB)\n**Security:** Time-window codes protect each upload\n**Career tracking:** Separate records for internships/jobs",
        quickActions: [
          { label: 'Go to Upload', action: 'navigate', value: '/upload' },
          { label: 'File Requirements', action: 'message', value: 'What are the file requirements?' }
        ]
      };
    }

    // Verification related
    if (msg.includes('verify') || msg.includes('check')) {
      return {
        content: "🔍 **How to Verify a Certificate:**\n\n1. **Get the Hash** - From certificate owner or QR code\n2. **Go to Verify Page** - Click 'Verify' in navigation\n3. **Enter Hash** - Paste the 64-character hash\n4. **Click Verify** - System checks blockchain records\n5. **View Results** - See authenticity and details\n\n**What you'll see:**\n• ✅ Verification status (Valid/Invalid)\n• 📊 Confidence level and AI analysis\n• 🔗 Blockchain transaction details\n• 📱 QR code for sharing\n• 📄 Certificate information\n\n**Public verification** - Anyone can verify with just the hash!",
        quickActions: [
          { label: 'Verify Now', action: 'navigate', value: '/verify' },
          { label: 'How Verification Works', action: 'message', value: 'Explain the verification process' }
        ]
      };
    }

    // Dashboard related
    if (msg.includes('dashboard') || msg.includes('my certificates')) {
      return {
        content: "📊 **Your Dashboard Features:**\n\n**Certificate Management:**\n• View all uploaded certificates\n• Filter by status (verified/pending/failed)\n• Filter by career type (internship/job)\n• Search by name, institution, or details\n\n**Download Options:**\n• 📄 PDF Certificate (printable)\n• 🌐 HTML Certificate (web-friendly)\n• 📋 JSON Data (raw information)\n• 📁 Original File (with BlockCert stamp)\n\n**Additional Features:**\n• 📱 Generate QR codes for sharing\n• 👁️ View detailed certificate information\n• 🗑️ Delete certificates\n• 📈 View statistics and analytics",
        quickActions: [
          { label: 'Open Dashboard', action: 'navigate', value: '/dashboard' },
          { label: 'Download Options', action: 'message', value: 'What download formats are available?' }
        ]
      };
    }

    // File formats and requirements
    if (msg.includes('format') || msg.includes('file') || msg.includes('requirement')) {
      return {
        content: "📁 **File Requirements:**\n\n**Supported Formats:**\n• 📄 PDF - Most common for certificates\n• 🖼️ Images - PNG, JPG, JPEG\n\n**File Specifications:**\n• 📏 Maximum size: 10MB per file\n• 🔍 AI analyzes all formats automatically\n• 🛡️ Secure upload with encryption\n• ⚡ Fast processing and verification\n\n**Best Practices:**\n• Use high-resolution scans\n• Ensure text is clearly readable\n• Include all certificate details\n• Avoid heavily compressed images",
        quickActions: [
          { label: 'Upload Now', action: 'navigate', value: '/upload' },
          { label: 'Security Features', action: 'message', value: 'What are forward & backward security codes?' }
        ]
      };
    }

    // How it works
    if (msg.includes('how') && (msg.includes('work') || msg.includes('process'))) {
      return {
        content: "⚙️ **How BlockCert Works:**\n\n**Step 1: Secure Upload**\n• Generate time-window security codes\n• Choose internship or job application\n• Fill certificate and career details\n• Upload document with AI analysis\n\n**Step 2: AI Verification**\n• Document format analysis\n• Certificate structure validation\n• Content verification\n• Metadata validation\n• Security codes verification\n\n**Step 3: Blockchain Storage**\n• Generate unique hash for document\n• Store immutable record on blockchain\n• Create verification transaction\n• Generate QR code for sharing\n\n**Step 4: Access & Share**\n• Download in multiple formats\n• Share verification links\n• Manage from dashboard\n• Track career applications",
        quickActions: [
          { label: 'Try Upload', action: 'navigate', value: '/upload' },
          { label: 'Try Verification', action: 'navigate', value: '/verify' }
        ]
      };
    }

    // Default response
    return {
      content: "👋 **Welcome to BlockCert AI Assistant!**\n\nI can help you with:\n\n🔒 **Advanced Security**\n• Forward/backward time-window codes\n• Blockchain protection and verification\n• Replay attack prevention\n\n💼 **Career Management**\n• Internship certificate uploads\n• Job application document tracking\n• Skills and achievements management\n\n📤 **Smart Uploads**\n• AI-powered document analysis\n• Multi-format support (PDF, images)\n• Real-time authenticity checking\n\n🔍 **Instant Verification**\n• Hash-based certificate checking\n• QR code generation and sharing\n• Public verification links\n\n**What would you like to do?**",
      quickActions: [
        { label: 'Upload Certificate', action: 'navigate', value: '/upload' },
        { label: 'Verify Document', action: 'navigate', value: '/verify' },
        { label: 'View Dashboard', action: 'navigate', value: '/dashboard' },
        { label: 'Security Info', action: 'message', value: 'What are forward & backward security codes?' },
        { label: 'Career Features', action: 'message', value: 'How do I apply my Internship/Job details for verification?' }
      ]
    };
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}