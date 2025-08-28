import jwt from 'jsonwebtoken';

// JWT Configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ALGORITHM: 'HS256' as const,
  ISSUER: process.env.JWT_ISSUER || 'venu-api',
  AUDIENCE: process.env.JWT_AUDIENCE || 'venu-app',
};

// Validate JWT configuration
export const validateJWTConfig = (): void => {
  if (!JWT_CONFIG.SECRET || JWT_CONFIG.SECRET === 'your-secret-key' || JWT_CONFIG.SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and be at least 32 characters long');
  }
};

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Generate JWT token with consistent options
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string => {
  validateJWTConfig();
  
  return jwt.sign(payload, JWT_CONFIG.SECRET!, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
    algorithm: JWT_CONFIG.ALGORITHM,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  });
};

// Verify JWT token with consistent options
export const verifyToken = (token: string): JWTPayload => {
  validateJWTConfig();
  
  return jwt.verify(token, JWT_CONFIG.SECRET!, {
    algorithms: [JWT_CONFIG.ALGORITHM],
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  }) as JWTPayload;
};
