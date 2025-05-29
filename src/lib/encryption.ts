import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';
const ALGORITHM = 'aes-256-cbc';

// Encrypt text
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt text
export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encrypted = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Check if text is encrypted
export function isEncrypted(text: string): boolean {
  return text.includes(':') && text.length > 32;
}

// Check if text is bcrypt hash
export function isBcryptHash(text: string): boolean {
  return text.startsWith('$2b$') || text.startsWith('$2a$') || text.startsWith('$2y$');
}

// Simple encoding for development
export function simpleEncode(text: string): string {
  return Buffer.from(text).toString('base64');
}

// Simple decoding for development
export function simpleDecode(encodedText: string): string {
  return Buffer.from(encodedText, 'base64').toString('utf8');
}
