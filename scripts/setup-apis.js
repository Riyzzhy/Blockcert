#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Free API providers with setup instructions
const providers = [
  {
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    url: 'https://console.groq.com',
    priority: 1,
    description: '⚡ Fastest inference, generous free tier',
    limits: '30 req/min, 6,000 req/day',
    setup: [
      '1. Visit console.groq.com',
      '2. Sign up with email (no phone required)',
      '3. Go to API Keys section',
      '4. Create new API key',
      '5. Copy the key starting with "gsk_"'
    ]
  },
  {
    name: 'Google AI Studio',
    envKey: 'GOOGLE_AI_API_KEY',
    url: 'https://aistudio.google.com',
    priority: 2,
    description: '🧠 Powerful Gemini models, completely free',
    limits: '15 req/min, 1,500 req/day, 1M tokens/month',
    setup: [
      '1. Visit aistudio.google.com',
      '2. Sign in with Google account',
      '3. Click "Get API Key"',
      '4. Create new project or use existing',
      '5. Copy the API key'
    ]
  },
  {
    name: 'Hugging Face',
    envKey: 'HUGGINGFACE_API_KEY',
    url: 'https://huggingface.co',
    priority: 3,
    description: '🤗 Open source models, always available',
    limits: 'Varies by model, serverless inference',
    setup: [
      '1. Visit huggingface.co',
      '2. Sign up with email',
      '3. Go to Settings → Access Tokens',
      '4. Create new token (read access)',
      '5. Copy the token starting with "hf_"'
    ]
  },
  {
    name: 'Together AI',
    envKey: 'TOGETHER_API_KEY',
    url: 'https://together.ai',
    priority: 4,
    description: '🤝 Large models like LLaMA 3.3 70B',
    limits: '60 req/min, free models available',
    setup: [
      '1. Visit together.ai',
      '2. Sign up with email',
      '3. Go to API Keys section',
      '4. Create new API key',
      '5. Copy the API key'
    ]
  },
  {
    name: 'Cohere',
    envKey: 'COHERE_API_KEY',
    url: 'https://cohere.com',
    priority: 5,
    description: '💬 Conversation-optimized models',
    limits: '20 req/min, 1,000 req/month',
    setup: [
      '1. Visit cohere.com',
      '2. Sign up with email',
      '3. Go to API Keys section',
      '4. Create new API key',
      '5. Copy the API key'
    ]
  }
];

// Read current .env file
function readEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (error) {
    log('❌ .env file not found. Please run this from the project root.', 'red');
    process.exit(1);
  }
}

// Update .env file with new API key
function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '..', '.env');
  let content = fs.readFileSync(envPath, 'utf8');
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, content);
  log(`✅ Updated ${key} in .env file`, 'green');
}

// Check which providers are configured
function checkConfiguredProviders() {
  const env = readEnvFile();
  const configured = [];
  const missing = [];
  
  providers.forEach(provider => {
    const value = env[provider.envKey];
    if (value && value !== `your_${provider.envKey.toLowerCase()}_here` && !value.includes('your_')) {
      configured.push(provider);
    } else {
      missing.push(provider);
    }
  });
  
  return { configured, missing };
}

// Test API key by making a simple request
async function testApiKey(provider, apiKey) {
  try {
    let response;
    
    switch (provider.name) {
      case 'Groq':
        response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        break;
        
      case 'Google AI Studio':
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        break;
        
      case 'Hugging Face':
        response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ inputs: 'test' })
        });
        break;
        
      case 'Together AI':
        response = await fetch('https://api.together.xyz/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        break;
        
      case 'Cohere':
        response = await fetch('https://api.cohere.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        break;
        
      default:
        return false;
    }
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Interactive setup
async function interactiveSetup() {
  log('\n🚀 Free AI API Setup for Your Chatbot', 'cyan');
  log('=====================================', 'cyan');
  
  const { configured, missing } = checkConfiguredProviders();
  
  if (configured.length > 0) {
    log('\n✅ Configured Providers:', 'green');
    configured.forEach(provider => {
      log(`   ${provider.name} - ${provider.description}`, 'green');
    });
  }
  
  if (missing.length === 0) {
    log('\n🎉 All providers are configured! Your chatbot is ready.', 'green');
    return;
  }
  
  log('\n📋 Missing Providers (Recommended to add at least 2):', 'yellow');
  missing.sort((a, b) => a.priority - b.priority).forEach((provider, index) => {
    log(`\n${index + 1}. ${provider.name}`, 'bright');
    log(`   ${provider.description}`, 'cyan');
    log(`   Limits: ${provider.limits}`, 'blue');
    log(`   URL: ${provider.url}`, 'magenta');
  });
  
  log('\n🎯 Recommended Quick Setup:', 'yellow');
  log('1. Start with Groq (fastest, best free tier)', 'yellow');
  log('2. Add Google AI Studio (reliable backup)', 'yellow');
  log('3. This gives you 7,500+ free requests per day!', 'yellow');
  
  // Auto-open browser for top 2 providers
  const topProviders = missing.sort((a, b) => a.priority - b.priority).slice(0, 2);
  
  log('\n🌐 Opening signup pages for recommended providers...', 'cyan');
  
  for (const provider of topProviders) {
    log(`\n📖 ${provider.name} Setup Instructions:`, 'bright');
    provider.setup.forEach(step => log(`   ${step}`, 'cyan'));
    
    // Open browser (works on most systems)
    try {
      const { exec } = await import('child_process');
      const command = process.platform === 'win32' ? 'start' : 
                    process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${command} ${provider.url}`);
      log(`   🌐 Opened ${provider.url}`, 'green');
    } catch (error) {
      log(`   🌐 Please visit: ${provider.url}`, 'magenta');
    }
    
    log('\n⏳ After getting your API key, come back and run:', 'yellow');
    log(`   npm run setup:apis`, 'bright');
  }
}

// Main function
async function main() {
  try {
    await interactiveSetup();
    
    log('\n📚 Next Steps:', 'cyan');
    log('1. Get API keys from the opened websites', 'cyan');
    log('2. Add them to your .env file', 'cyan');
    log('3. Run: npm run test:chatbot', 'cyan');
    log('4. Start your app: npm run dev:full', 'cyan');
    
    log('\n💡 Pro Tips:', 'yellow');
    log('• Groq is fastest - use it as primary', 'yellow');
    log('• Google AI is most reliable - use as backup', 'yellow');
    log('• Multiple providers = automatic fallback', 'yellow');
    log('• All providers are completely free!', 'yellow');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { providers, testApiKey, checkConfiguredProviders };
