import { supabase } from '../supabaseClient';

/**
 * Validates a Cloudflare Turnstile token using the Supabase Edge Function
 * @param {string} token - The Turnstile token to validate
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const validateTurnstileToken = async (token) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-turnstile', {
      body: { token }
    });

    if (error) {
      console.error('Turnstile validation error:', error);
      return { success: false, error: 'Validation failed' };
    }

    if (data && data.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: data?.error || 'Token verification failed' 
      };
    }

  } catch (error) {
    console.error('Turnstile validation exception:', error);
    return { success: false, error: 'Network error' };
  }
}; 