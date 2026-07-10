// Security utilities for data protection and validation

export const sanitizeInput = (input: string): string => {
  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhone = (phone: string): boolean => {
  // Nepal phone number validation
  const phoneRegex = /^(\+977)?[98]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const rateLimit = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),
  
  canAttempt(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key);
    
    if (!userAttempts) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - userAttempts.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    userAttempts.lastAttempt = now;
    return true;
  },
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
};

export const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), fullscreen=(self)'
};

// Remove sensitive data from objects before logging
export const sanitizeForLogging = (obj: any): any => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'session'];
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Environment-aware logging
export const secureLog = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.info(message, data ? sanitizeForLogging(data) : '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.warn(message, data ? sanitizeForLogging(data) : '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(message, error ? sanitizeForLogging(error) : '');
    }
    // In production, you would send to error tracking service
  }
};