import CryptoJS from 'crypto-js';

export interface SecurityCodes {
  forwardCode: string;
  backwardCode: string;
  sessionId: string;
  expiresAt: Date;
  userId?: string;
}

export interface TimeWindowSession {
  sessionId: string;
  forwardCode: string;
  backwardCode: string;
  createdAt: Date;
  expiresAt: Date;
  userId?: string;
  isUsed: boolean;
  ipAddress: string;
  userAgent: string;
}

export class SecurityManager {
  private static readonly SECRET_KEY = 'blockcert-security-2024';
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private static sessions = new Map<string, TimeWindowSession>();

  /**
   * Generate forward and backward security codes for a session
   */
  static generateSecurityCodes(userId?: string, ipAddress?: string, userAgent?: string): SecurityCodes {
    const sessionId = this.generateSessionId();
    const timestamp = Date.now();
    const expiresAt = new Date(timestamp + this.SESSION_DURATION);

    // Generate forward code (time-based + user-specific)
    const forwardSeed = `${sessionId}-${timestamp}-${userId || 'anonymous'}-forward`;
    const forwardCode = CryptoJS.SHA256(forwardSeed + this.SECRET_KEY).toString();

    // Generate backward code (reverse time-based + session-specific)
    const backwardSeed = `${sessionId}-${timestamp}-${userId || 'anonymous'}-backward`;
    const backwardCode = CryptoJS.SHA256(backwardSeed + this.SECRET_KEY).toString();

    // Store session
    const session: TimeWindowSession = {
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

    this.sessions.set(sessionId, session);

    // Clean up expired sessions
    this.cleanupExpiredSessions();

    return {
      forwardCode,
      backwardCode,
      sessionId,
      expiresAt,
      userId
    };
  }

  /**
   * Validate security codes and mark session as used
   */
  static validateSecurityCodes(
    sessionId: string, 
    forwardCode: string, 
    backwardCode: string,
    userId?: string
  ): { valid: boolean; reason?: string } {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (session.isUsed) {
      return { valid: false, reason: 'Security codes already used' };
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
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
    this.sessions.set(sessionId, session);

    return { valid: true };
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  /**
   * Clean up expired sessions
   */
  private static cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session info (for debugging/monitoring)
   */
  static getSessionInfo(sessionId: string): TimeWindowSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get active sessions count (for monitoring)
   */
  static getActiveSessionsCount(): number {
    this.cleanupExpiredSessions();
    return this.sessions.size;
  }

  /**
   * Refresh security codes (generate new ones for same session)
   */
  static refreshSecurityCodes(sessionId: string): SecurityCodes | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.isUsed || new Date() > session.expiresAt) {
      return null;
    }

    // Generate new codes for the same session
    const timestamp = Date.now();
    const newExpiresAt = new Date(timestamp + this.SESSION_DURATION);

    const forwardSeed = `${sessionId}-${timestamp}-${session.userId || 'anonymous'}-forward-refresh`;
    const newForwardCode = CryptoJS.SHA256(forwardSeed + this.SECRET_KEY).toString();

    const backwardSeed = `${sessionId}-${timestamp}-${session.userId || 'anonymous'}-backward-refresh`;
    const newBackwardCode = CryptoJS.SHA256(backwardSeed + this.SECRET_KEY).toString();

    // Update session
    session.forwardCode = newForwardCode;
    session.backwardCode = newBackwardCode;
    session.expiresAt = newExpiresAt;
    session.isUsed = false;

    this.sessions.set(sessionId, session);

    return {
      forwardCode: newForwardCode,
      backwardCode: newBackwardCode,
      sessionId,
      expiresAt: newExpiresAt,
      userId: session.userId
    };
  }
}