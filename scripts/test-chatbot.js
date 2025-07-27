#!/usr/bin/env node

import { providers, testApiKey, checkConfiguredProviders } from './setup-apis.js';
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

// Read .env file
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

// Test chatbot endpoint
async function testChatbotEndpoint() {
  try {
    const response = await fetch('http://localhost:3001/api/chatbot/health');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Test individual provider
async function testProvider(provider, apiKey) {
  log(`\n🧪 Testing ${provider.name}...`, 'cyan');
  
  try {
    const isValid = await testApiKey(provider, apiKey);
    if (isValid) {
      log(`✅ ${provider.name} - API key is valid`, 'green');
      return true;
    } else {
      log(`❌ ${provider.name} - API key is invalid or expired`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${provider.name} - Error: ${error.message}`, 'red');
    return false;
  }
}

// Test chatbot conversation
async function testChatbotConversation() {
  log('\n💬 Testing chatbot conversation...', 'cyan');
  
  try {
    const response = await fetch('http://localhost:3001/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Can you help me with certificate verification?',
        conversationHistory: []
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅ Chatbot conversation test successful', 'green');
      log(`📝 Response: ${data.response.substring(0, 100)}...`, 'blue');
      log(`🤖 Provider used: ${data.provider || 'Unknown'}`, 'magenta');
      return true;
    } else {
      const errorData = await response.json();
      log(`❌ Chatbot conversation failed: ${errorData.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Chatbot conversation error: ${error.message}`, 'red');
    log('💡 Make sure the server is running: npm run server:dev', 'yellow');
    return false;
  }
}

// Main testing function
async function runTests() {
  log('🧪 Chatbot API Testing Suite', 'cyan');
  log('============================', 'cyan');
  
  const env = readEnvFile();
  const { configured, missing } = checkConfiguredProviders();
  
  if (configured.length === 0) {
    log('\n❌ No API providers configured!', 'red');
    log('💡 Run: npm run setup:apis', 'yellow');
    return;
  }
  
  log(`\n📊 Found ${configured.length} configured provider(s)`, 'green');
  
  // Test each configured provider
  const results = [];
  for (const provider of configured) {
    const apiKey = env[provider.envKey];
    const isWorking = await testProvider(provider, apiKey);
    results.push({ provider, isWorking });
  }
  
  // Test server health
  log('\n🏥 Testing server health...', 'cyan');
  const healthData = await testChatbotEndpoint();
  if (healthData) {
    log('✅ Server is running and healthy', 'green');
    log(`📊 Server status: ${JSON.stringify(healthData, null, 2)}`, 'blue');
  } else {
    log('❌ Server is not running or unhealthy', 'red');
    log('💡 Start the server: npm run server:dev', 'yellow');
  }
  
  // Test actual chatbot conversation
  if (healthData) {
    await testChatbotConversation();
  }
  
  // Summary
  log('\n📋 Test Summary', 'cyan');
  log('===============', 'cyan');
  
  const workingProviders = results.filter(r => r.isWorking);
  const failedProviders = results.filter(r => !r.isWorking);
  
  if (workingProviders.length > 0) {
    log(`\n✅ Working Providers (${workingProviders.length}):`, 'green');
    workingProviders.forEach(({ provider }) => {
      log(`   • ${provider.name} - ${provider.description}`, 'green');
    });
  }
  
  if (failedProviders.length > 0) {
    log(`\n❌ Failed Providers (${failedProviders.length}):`, 'red');
    failedProviders.forEach(({ provider }) => {
      log(`   • ${provider.name} - Check API key`, 'red');
    });
  }
  
  if (missing.length > 0) {
    log(`\n⚠️  Missing Providers (${missing.length}):`, 'yellow');
    missing.forEach(provider => {
      log(`   • ${provider.name} - ${provider.description}`, 'yellow');
    });
    log('\n💡 Add more providers for better reliability:', 'yellow');
    log('   npm run setup:apis', 'bright');
  }
  
  // Recommendations
  log('\n🎯 Recommendations:', 'cyan');
  if (workingProviders.length === 0) {
    log('❌ No working providers! Your chatbot will not work.', 'red');
    log('🔧 Fix: Check your API keys and run setup again', 'yellow');
  } else if (workingProviders.length === 1) {
    log('⚠️  Only 1 working provider. Add a backup for reliability.', 'yellow');
    log('🔧 Recommended: Add Google AI Studio as backup', 'yellow');
  } else {
    log('✅ Multiple working providers - excellent reliability!', 'green');
    log('🎉 Your chatbot is ready for production use!', 'green');
  }
  
  // Next steps
  log('\n🚀 Next Steps:', 'cyan');
  if (workingProviders.length > 0) {
    log('1. Start your full application: npm run dev:full', 'cyan');
    log('2. Open http://localhost:5173 in your browser', 'cyan');
    log('3. Test the chatbot in the bottom-right corner', 'cyan');
    log('4. Ask questions about certificate verification!', 'cyan');
  } else {
    log('1. Fix API key issues', 'cyan');
    log('2. Run: npm run setup:apis', 'cyan');
    log('3. Run this test again: npm run test:chatbot', 'cyan');
  }
}

// Run tests
runTests().catch(error => {
  log(`❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
