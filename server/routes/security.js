import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = express.Router();

// Rate limiting for security endpoints
const securityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many security requests, please try again later.' }
});

// In-memory store for sessions (use Redis in production)
const sessions = new Map();
const SECRET_KEY = process.env.JWT_SECRET || 'blockcert-security-2024';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Generate security codes
function generateSecurityCodes(userId, ipAddress, userAgent) {
  const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const timestamp = Date.now();
  const expiresAt = new Date(timestamp + SESSION_DURATION);

  // Generate forward code (time-based + user-specific)
  const forwardSeed = `${sessionId}-${timestamp}-${userId || 'anonymous'}-forward`;
  const forwardCode = crypto.createHash('sha256').update(forwardSeed + SECRET_KEY).digest('hex');

  // Generate backward code (reverse time-based + session-specific)
  const backwardSeed = `${sessionId}-${timestamp}-${userId || 'anonymous'}-backward`;
  const backwardCode = crypto.createHash('sha256').update(backwardSeed + SECRET_KEY).digest('hex');

  // Store session
  const session = {
    sessionId,
    forwardCode,
    backwardCode,
    createdAt: new Date(),
    expiresAt,
    userId,
    isUsed: false,
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown'
  };

  sessions.set(sessionId, session);

  // Clean up expired sessions
  cleanupExpiredSessions();

  return {
    forwardCode,
    backwardCode,
    sessionId,
    expiresAt,
    userId
  };
}

// Validate security codes
function validateSecurityCodes(sessionId, forwardCode, backwardCode, userId) {
  const session = sessions.get(sessionId);

  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }

  if (session.isUsed) {
    return { valid: false, reason: 'Security codes already used' };
  }

  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return { valid: false, reason: 'Security codes expired' };
  }

  if (session.forwardCode !== forwardCode || session.backwardCode !== backwardCode) {
    return { valid: false, reason: 'Invalid security codes' };
  }

  if (userId && session.userId && session.userId !== userId) {
    return { valid: false, reason: 'User mismatch' };
  }

  // Mark session as used
  session.isUsed = true;
  sessions.set(sessionId, session);

  return { valid: true };
}

// Clean up expired sessions
function cleanupExpiredSessions() {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
    }
  }
}

// Refresh security codes
function refreshSecurityCodes(sessionId) {
  const session = sessions.get(sessionId);
  if (!session || session.isUsed || new Date() > session.expiresAt) {
    return null;
  }

  // Generate new codes for the same session
  const timestamp = Date.now();
  const newExpiresAt = new Date(timestamp + SESSION_DURATION);

  const forwardSeed = `${sessionId}-${timestamp}-${session.userId || 'anonymous'}-forward-refresh`;
  const newForwardCode = crypto.createHash('sha256').update(forwardSeed + SECRET_KEY).digest('hex');

  const backwardSeed = `${sessionId}-${timestamp}-${session.userId || 'anonymous'}-backward-refresh`;
  const newBackwardCode = crypto.createHash('sha256').update(backwardSeed + SECRET_KEY).digest('hex');

  // Update session
  session.forwardCode = newForwardCode;
  session.backwardCode = newBackwardCode;
  session.expiresAt = newExpiresAt;
  session.isUsed = false;

  sessions.set(sessionId, session);

  return {
    forwardCode: newForwardCode,
    backwardCode: newBackwardCode,
    sessionId,
    expiresAt: newExpiresAt,
    userId: session.userId
  };
}

// POST /api/security/generate - Generate new security codes
router.post('/generate', securityLimiter, (req, res) => {
  try {
    const { userId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const securityCodes = generateSecurityCodes(userId, ipAddress, userAgent);

    res.json({
      securityCodes,
      expiresIn: SESSION_DURATION,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Security code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate security codes' 
    });
  }
});

// POST /api/security/validate - Validate security codes
router.post('/validate', securityLimiter, (req, res) => {
  try {
    const { sessionId, forwardCode, backwardCode, userId } = req.body;

    if (!sessionId || !forwardCode || !backwardCode) {
      return res.status(400).json({ 
        error: 'Missing required security parameters' 
      });
    }

    const validation = validateSecurityCodes(sessionId, forwardCode, backwardCode, userId);

    if (!validation.valid) {
      return res.status(401).json({ 
        error: validation.reason,
        valid: false 
      });
    }

    res.json({ 
      valid: true,
      message: 'Security codes validated successfully',
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Security validation error:', error);
    res.status(500).json({ 
      error: 'Security validation failed' 
    });
  }
});

// POST /api/security/refresh - Refresh security codes
router.post('/refresh', securityLimiter, (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID required' 
      });
    }

    const newCodes = refreshSecurityCodes(sessionId);

    if (!newCodes) {
      return res.status(404).json({ 
        error: 'Session not found or expired' 
      });
    }

    res.json({
      securityCodes: newCodes,
      message: 'Security codes refreshed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Security refresh error:', error);
    res.status(500).json({ 
      error: 'Failed to refresh security codes' 
    });
  }
});

// GET /api/security/status - Get security status
router.get('/status', (req, res) => {
  cleanupExpiredSessions();
  
  res.json({
    activeSessions: sessions.size,
    sessionDuration: SESSION_DURATION,
    timestamp: new Date().toISOString()
  });
});

export default router;