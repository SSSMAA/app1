// Simple JWT implementation for authentication
// Note: This is a simplified implementation for demo purposes
// In production, use a proper JWT library

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  exp: number;
  iat: number;
}

export class JWTService {
  private static SECRET_KEY = 'ischoolgo-secret-key-2024';
  
  // Simple base64 encoding/decoding functions
  private static base64UrlEncode(str: string): string {
    try {
      // Handle UTF-8 characters properly
      const encoded = btoa(unescape(encodeURIComponent(str)));
      return encoded
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (error) {
      console.error('Base64 encoding error:', error);
      // Fallback: use a simple encoding
      return str.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    }
  }
  
  private static base64UrlDecode(str: string): string {
    try {
      str += '==='.slice(0, (4 - str.length % 4) % 4);
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(str);
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      console.error('Base64 decoding error:', error);
      // Fallback: return as is
      return str;
    }
  }
  
  // Create a simple signature (for demo purposes)
  private static async createSignature(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.SECRET_KEY);
      const messageData = encoder.encode(data);
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, messageData);
      const signatureArray = Array.from(new Uint8Array(signature));
      return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Signature error:', error);
      // Fallback simple signature for demo
      return btoa(data + this.SECRET_KEY).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    }
  }
  
  static async sign(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 hours
    };
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.createSignature(dataToSign);
    const encodedSignature = this.base64UrlEncode(signature);
    
    return `${dataToSign}.${encodedSignature}`;
  }
  
  static async verify(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const dataToVerify = `${encodedHeader}.${encodedPayload}`;
      
      // Verify signature
      const expectedSignature = await this.createSignature(dataToVerify);
      const expectedEncodedSignature = this.base64UrlEncode(expectedSignature);
      
      if (encodedSignature !== expectedEncodedSignature) {
        return null;
      }
      
      // Decode and verify payload
      const payloadJson = this.base64UrlDecode(encodedPayload);
      const payload: JWTPayload = JSON.parse(payloadJson);
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }
  
  static extractTokenFromRequest(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}