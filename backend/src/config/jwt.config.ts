import jwt from 'jsonwebtoken';

// Get JWT configuration dynamically to ensure environment variables are loaded
const getJWTConfig = () => ({
  SECRET: process.env.JWT_SECRET || '',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ALGORITHM: 'HS256' as const,
  ISSUER: process.env.JWT_ISSUER || 'venu-api',
  AUDIENCE: process.env.JWT_AUDIENCE || 'venu-app',
});

// Validate JWT configuration
export const validateJWTConfig = (): void => {
  const config = getJWTConfig();
  console.log('JWT_SECRET length:', config.SECRET?.length);
  console.log('JWT_SECRET exists:', !!config.SECRET);
  console.log('JWT_SECRET starts with:', config.SECRET?.substring(0, 10));
  
  if (!config.SECRET || config.SECRET === 'your-secret-key' || config.SECRET.length < 32) {
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
  const config = getJWTConfig();
  
  return jwt.sign(payload, config.SECRET, {
    expiresIn: config.EXPIRES_IN,
    algorithm: 'HS256' as jwt.Algorithm,
    issuer: config.ISSUER,
    audience: config.AUDIENCE,
  } as jwt.SignOptions);
};

// Verify JWT token with consistent options
export const verifyToken = (token: string): JWTPayload => {
  validateJWTConfig();
  const config = getJWTConfig();
  
  return jwt.verify(token, config.SECRET, {
    algorithms: [config.ALGORITHM],
    issuer: config.ISSUER,
    audience: config.AUDIENCE,
  }) as JWTPayload;
};
