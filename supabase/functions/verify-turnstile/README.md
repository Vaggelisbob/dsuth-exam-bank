# Turnstile Verification Edge Function

This Edge Function validates Cloudflare Turnstile tokens server-side for enhanced security.

## Setup Instructions

### 1. Get your Turnstile Secret Key
1. Go to [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/)
2. Navigate to Turnstile → Your Site
3. Copy the **Secret Key** (not the Site Key)

### 2. Deploy the Edge Function
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref YOUR_PROJECT_REF

# Set the secret key as environment variable
supabase secrets set TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE

# Deploy the function
supabase functions deploy verify-turnstile
```

### 3. Test the Function
The function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/verify-turnstile
```

### 4. Usage in Frontend
The frontend already includes the validation utility in `src/utils/turnstileValidation.js`.

## Security Notes
- The Secret Key is stored securely in Supabase environment variables
- The function validates tokens against Cloudflare's official API
- CORS is properly configured for cross-origin requests
- Error handling includes detailed logging for debugging

## Troubleshooting
- Ensure your Secret Key is correct
- Check that the function is deployed successfully
- Verify CORS settings if you encounter cross-origin issues
- Monitor Supabase logs for any errors 