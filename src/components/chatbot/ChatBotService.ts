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
      // Try to call the backend chatbot API if available
      const response = await fetch('/api/chatbot', {
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
      }
    } catch (error) {
      console.log('Backend chatbot not available, using local responses');
    }

    // Fallback to local responses
    const localResponse = this.generateLocalResponse(message);
    this.conversationHistory.push({ role: 'assistant', content: localResponse.content });
    
    return localResponse;
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
        content: "I'll help you upload a certificate! You can upload PDF, PNG, JPG, or JPEG files. Our AI will analyze the document for authenticity and store it securely on the blockchain.",
        quickActions: [
          { label: 'Go to Upload', action: 'navigate', value: '/upload' },
          { label: 'File Requirements', action: 'message', value: 'What are the file requirements?' }
        ]
      };
    }

    // Verification related
    if (msg.includes('verify') || msg.includes('check')) {
      return {
        content: "You can verify any certificate using its blockchain hash. This will show you the authenticity, confidence level, and all verification details stored on the blockchain.",
        quickActions: [
          { label: 'Verify Now', action: 'navigate', value: '/verify' },
          { label: 'How Verification Works', action: 'message', value: 'Explain the verification process' }
        ]
      };
    }

    // Dashboard related
    if (msg.includes('dashboard') || msg.includes('my certificates')) {
      return {
        content: "Your dashboard shows all uploaded certificates, their verification status, and allows you to download them in various formats (PDF, HTML, JSON) or generate QR codes.",
        quickActions: [
          { label: 'Open Dashboard', action: 'navigate', value: '/dashboard' },
          { label: 'Download Options', action: 'message', value: 'What download formats are available?' }
        ]
      };
    }

    // How it works
    if (msg.includes('how') && (msg.includes('work') || msg.includes('process'))) {
      return {
        content: "BlockCert works in 4 simple steps:\n\n1. **Upload** - Upload your certificate (PDF/Image)\n2. **AI Analysis** - Our AI scans for authenticity indicators\n3. **Blockchain Storage** - Document hash is stored immutably\n4. **Verification** - Get a verified certificate with QR code\n\nEach step ensures maximum security and authenticity!",
        quickActions: [
          { label: 'Try Upload', action: 'navigate', value: '/upload' },
          { label: 'Try Verification', action: 'navigate', value: '/verify' }
        ]
      };
    }

    // File formats
    if (msg.includes('format') || msg.includes('file type')) {
      return {
        content: "We support these file formats:\n\n📄 **PDF** - Most common for certificates\n🖼️ **Images** - PNG, JPG, JPEG\n📏 **Size Limit** - Maximum 10MB per file\n\nAll files are processed automatically with AI analysis for authenticity detection.",
        quickActions: [
          { label: 'Upload Now', action: 'navigate', value: '/upload' },
          { label: 'More Questions', action: 'message', value: 'I have more questions' }
        ]
      };
    }

    // Default response
    return {
      content: "I'm here to help with BlockCert! I can assist you with:\n\n📤 **Certificate Uploads** - Upload and verify documents with advanced security\n🔍 **Hash Verification** - Check certificate authenticity\n📊 **Dashboard Management** - View and download certificates\n💼 **Career Applications** - Internship/Job toggle and tracking\n🔒 **Security Features** - Forward/backward codes and time-window protection\n❓ **General Questions** - Platform features and pricing\n\nWhat would you like to do?",
      quickActions: [
        { label: 'Upload Certificate', action: 'navigate', value: '/upload' },
        { label: 'Verify Document', action: 'navigate', value: '/verify' },
        { label: 'View Dashboard', action: 'navigate', value: '/dashboard' },
        { label: 'Security Info', action: 'message', value: 'What are forward & backward security codes?' },
        { label: 'Learn More', action: 'external', value: '#about' }
      ]
    };
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}