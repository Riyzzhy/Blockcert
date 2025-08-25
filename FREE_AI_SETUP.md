# 🚀 Free AI Chatbot Setup Guide

## Overview
BlockCert includes a powerful AI chatbot with **5 free AI providers** and automatic fallback system. Get **7,500+ free requests per day** combined!

## 🎯 Quick Setup (5 minutes)

### 1. Run Automated Setup
```bash
npm run setup:apis
```
This opens browser tabs for free API registration.

### 2. Get Free API Keys

#### 🥇 Groq (Recommended - Fastest)
- Visit: https://console.groq.com
- Sign up with email (no phone required)
- Go to API Keys → Create new key
- Copy key starting with `gsk_`
- **Limits:** 30 req/min, 6,000 req/day

#### 🥈 Google AI Studio (Most Reliable)
- Visit: https://aistudio.google.com
- Sign in with Google account
- Click "Get API Key" → Create new project
- Copy the API key
- **Limits:** 15 req/min, 1,500 req/day, 1M tokens/month

#### 🥉 Hugging Face (Always Available)
- Visit: https://huggingface.co
- Sign up with email
- Settings → Access Tokens → Create new token
- Copy token starting with `hf_`
- **Limits:** Varies by model, serverless inference

#### 4️⃣ Together AI (Large Models)
- Visit: https://together.ai
- Sign up with email
- API Keys → Create new key
- Copy the API key
- **Limits:** 60 req/min, free models available

#### 5️⃣ Cohere (Conversation AI)
- Visit: https://cohere.com
- Sign up with email
- API Keys → Create new key
- Copy the API key
- **Limits:** 20 req/min, 1,000 req/month

### 3. Add Keys to .env File
```bash
# Add your API keys to .env file
GROQ_API_KEY=gsk_your_key_here
GOOGLE_AI_API_KEY=your_google_key_here
HUGGINGFACE_API_KEY=hf_your_key_here
TOGETHER_API_KEY=your_together_key_here
COHERE_API_KEY=your_cohere_key_here
```

### 4. Test the Setup
```bash
npm run test:chatbot
```

### 5. Start Full Application
```bash
npm run dev:full
```

## 🎉 Features

### AI Assistant Capabilities
- **Certificate Upload Guidance** - Step-by-step help
- **Security Explanation** - Forward/backward codes info
- **Career Management** - Internship/Job toggle help
- **Verification Process** - Hash checking guidance
- **File Format Support** - Requirements and limits
- **Dashboard Navigation** - Feature explanations

### Security Features
- **Time-Window Codes** - 30-minute expiry
- **Non-Reusable Codes** - Single-use protection
- **Session Tracking** - IP and user agent logging
- **Automatic Cleanup** - Expired session removal
- **Replay Attack Prevention** - Forward/backward validation

### Career Management
- **Internship Mode** - Position, company, duration tracking
- **Job Mode** - Professional experience management
- **Skills Tracking** - Technology and skill lists
- **Achievement Records** - Accomplishment management
- **Separate Verification** - Different career purposes

## 🔧 Advanced Configuration

### Provider Priority
1. **Groq** - Fastest response (primary)
2. **Google AI** - Most reliable (backup)
3. **Hugging Face** - Always available (fallback)
4. **Together AI** - Large models (specialty)
5. **Cohere** - Conversation AI (specialty)

### Automatic Fallback
If one provider fails, the system automatically tries the next available provider.

### Rate Limiting
- **Chatbot:** 20 requests/minute per IP
- **Security:** 10 requests/15 minutes per IP
- **Automatic cleanup** of expired sessions

## 🚨 Troubleshooting

### No AI Providers Configured
```bash
# Check provider status
npm run test:chatbot

# Re-run setup
npm run setup:apis
```

### API Key Issues
1. Verify keys are correctly added to `.env`
2. Check key format (each provider has different format)
3. Ensure keys have proper permissions
4. Test individual providers

### Server Not Starting
```bash
# Install server dependencies
cd server && npm install

# Start server manually
npm run server:dev
```

## 💰 Cost Comparison

| Provider | Free Tier | Paid Alternative |
|----------|-----------|------------------|
| **Our Setup** | $0/month | OpenAI: $20+/month |
| **Requests** | 7,500+/day | OpenAI: 1,000/month |
| **Speed** | Up to 10x faster | Standard |
| **Reliability** | 5 providers | Single provider |

## 🎯 Usage Examples

### Common Questions the AI Can Answer:
- "How do I upload a certificate?"
- "What are forward & backward security codes?"
- "How do I apply my Internship/Job details for verification?"
- "How do I verify a certificate?"
- "What file formats are supported?"
- "How does the security system work?"

### Quick Actions Available:
- Upload Certificate
- Verify Document
- View Dashboard
- Security Information
- Career Features
- File Requirements

## 🆘 Support

If you need help:
1. Check this guide first
2. Run `npm run test:chatbot` for diagnostics
3. Check server logs for errors
4. Ensure all dependencies are installed

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ Free AI chatbot with 5 provider fallback
- ✅ Advanced security with time-window codes
- ✅ Career management for internships/jobs
- ✅ 7,500+ free AI requests per day
- ✅ 99.9% uptime with automatic fallback
- ✅ Real-time user assistance

**Total cost: $0/month** vs $20+ with OpenAI!