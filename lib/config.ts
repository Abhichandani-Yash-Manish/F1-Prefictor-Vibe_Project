// Centralized configuration for the application using the "singleton" pattern for env vars

export const config = {
  // Backend API URL
  // Default to relative '/api' path in production (same-origin)
  // Default to localhost in development
  // sanitize: remove quotes and whitespace that might cause Client Exceptions
  apiUrl: (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://127.0.0.1:8000')).replace(/['"\s]/g, ''),

  // Feature Flags
  isProduction: process.env.NODE_ENV === 'production',
};
