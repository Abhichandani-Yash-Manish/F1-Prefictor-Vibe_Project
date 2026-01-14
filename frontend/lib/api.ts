/**
 * Robust API Client for F1 Apex
 * 
 * This module handles ALL backend API calls with proper error handling,
 * header sanitization, and Safari/WebKit compatibility.
 */

// Base URL - determined at runtime, not build time
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use relative path or env var
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  
  // Client-side: ALWAYS use absolute URL to avoid Safari issues
  const origin = window.location.origin;
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl && envUrl.startsWith('http')) {
    // Explicit full URL provided (e.g., localhost for dev)
    return envUrl;
  }
  
  // Use origin + /api for production
  return `${origin}/api`;
}

/**
 * Sanitize a string for use in HTTP headers.
 * Removes any characters that could cause DOMException in Safari/WebKit.
 */
function sanitizeHeaderValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }
  // Keep only printable ASCII characters (space to tilde, plus common ones)
  // This excludes all control characters, newlines, tabs, etc.
  return value.replace(/[^\x20-\x7E]/g, '');
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Make an API call with full error handling.
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;
  
  try {
    // 1. Construct URL
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    console.log(`[API] ${method} ${url}`);
    
    // 2. Build headers safely
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      const safeToken = sanitizeHeaderValue(token);
      if (safeToken) {
        headers['Authorization'] = `Bearer ${safeToken}`;
      } else {
        console.warn('[API] Token was provided but empty after sanitization');
      }
    }
    
    // 3. Build request options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };
    
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // 4. Execute fetch
    const response = await fetch(url, fetchOptions);
    
    // 5. Parse response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Non-JSON response (could be HTML error page)
      const text = await response.text();
      data = { message: text } as T;
    }
    
    if (!response.ok) {
      const errorDetail = (data as any)?.detail || (data as any)?.message || 'Request failed';
      return {
        ok: false,
        status: response.status,
        data,
        error: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail),
      };
    }
    
    return {
      ok: true,
      status: response.status,
      data,
    };
    
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API] Fetch error:', errorMessage);
    
    return {
      ok: false,
      status: 0,
      data: {} as T,
      error: errorMessage,
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, token?: string) => 
    apiCall<T>(endpoint, { method: 'GET', token }),
    
  post: <T>(endpoint: string, body: Record<string, unknown>, token?: string) => 
    apiCall<T>(endpoint, { method: 'POST', body, token }),
    
  put: <T>(endpoint: string, body: Record<string, unknown>, token?: string) => 
    apiCall<T>(endpoint, { method: 'PUT', body, token }),
    
  delete: <T>(endpoint: string, token?: string) => 
    apiCall<T>(endpoint, { method: 'DELETE', token }),
};
