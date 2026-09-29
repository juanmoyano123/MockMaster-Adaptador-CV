# ARCHITECTURE: F-001 - User Authentication (Supabase)

## 1. USER FLOW

### Sign Up Flow (Email/Password)
1. User fills out signup form (name, email, password, confirm password)
2. Frontend validates password match and minimum length (8 chars)
3. Frontend calls Supabase `signUp()` with email and password
4. Supabase sends confirmation email
5. User clicks confirmation link
6. User is redirected to callback route
7. Session is established, user redirected to dashboard

### Sign Up Flow (Google OAuth)
1. User clicks "Continue with Google" button
2. Frontend calls Supabase `signInWithOAuth()` with Google provider
3. User is redirected to Google OAuth consent screen
4. User authorizes app
5. Google redirects back to callback route
6. Session is established, user redirected to dashboard

### Login Flow (Email/Password)
1. User fills out login form (email, password)
2. Frontend calls Supabase `signInWithPassword()`
3. If successful, session is created
4. User is redirected to dashboard

### Login Flow (Google OAuth)
1. Same as Google signup flow (Supabase handles signup vs login automatically)

### Forgot Password Flow
1. User enters email in forgot password form
2. Frontend calls Supabase `resetPasswordForEmail()`
3. Supabase sends password reset email
4. User clicks reset link
5. User is redirected to callback route with reset token
6. User enters new password
7. Frontend calls Supabase `updateUser()` with new password

### Session Persistence
1. Middleware checks for session token on every request
2. If token exists but expired, refresh it automatically
3. If token invalid, redirect to login
4. Protected routes check AuthContext for user

### Logout Flow
1. User clicks logout button
2. Frontend calls Supabase `signOut()`
3. Session is cleared
4. User is redirected to login page

## 2. DATABASE

No custom database tables needed for F-001. Supabase Auth uses built-in `auth.users` table.

### Supabase Auth Configuration (via Dashboard)
- Email auth: Enabled
- Email confirmations: Enabled (production), Disabled (development)
- Google OAuth: Enabled with client ID and secret
- Redirect URLs:
  - `http://localhost:3000/auth/callback` (development)
  - `https://yourdomain.com/auth/callback` (production)
- Site URL: `http://localhost:3000` (development)

### User Metadata Structure
```typescript
interface UserMetadata {
  name?: string;          // Full name from signup form or OAuth
  avatar_url?: string;    // Profile picture from OAuth
  email?: string;         // Email (also in auth.users.email)
}
```

## 3. API ENDPOINTS

### Supabase Auth Endpoints (Built-in)
All authentication is handled by Supabase client SDK, no custom API routes needed except:

#### `POST /auth/callback` (Route Handler)
- **Purpose**: Handle OAuth callbacks and email confirmations
- **Auth**: None (public)
- **Request**: Query params from Supabase (code, token_hash, type, etc.)
- **Response**: Redirect to dashboard or login
- **Error Cases**:
  - Missing code: Redirect to login with error
  - Invalid code: Redirect to login with error
  - Exchange failure: Redirect to login with error

## 4. REACT COMPONENTS

### Directory Structure
```
/contexts
  /AuthContext.tsx          # Auth state provider

/lib/supabase
  /client.ts                # Browser Supabase client
  /server.ts                # Server Supabase client (cookies)
  /middleware.ts            # Auth middleware utilities

/components/auth
  /LoginForm.tsx            # Update with Supabase (existing)
  /SignupForm.tsx           # Update with Supabase (existing)
  /ForgotPasswordForm.tsx   # Update with Supabase (existing)
  /AuthLayout.tsx           # Keep as is (existing)

/app/(auth)
  /login/page.tsx           # Keep as is (existing)
  /signup/page.tsx          # Keep as is (existing)
  /forgot-password/page.tsx # Keep as is (existing)

/app/auth/callback
  /route.ts                 # New: OAuth callback handler

/middleware.ts              # New: Root middleware for session refresh
```

### AuthContext API
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { name: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
```

### Component Updates

#### LoginForm.tsx
- Replace `handleSubmit` with call to `authContext.signIn()`
- Replace `handleGoogleLogin` with call to `authContext.signInWithGoogle()`
- Add error state and display error messages
- Add loading state with disabled button and spinner
- Handle redirects after successful login

#### SignupForm.tsx
- Replace `handleSubmit` with call to `authContext.signUp()`
- Replace `handleGoogleSignup` with call to `authContext.signInWithGoogle()`
- Add error state and display error messages
- Add loading state with disabled button and spinner
- Show success message: "Check your email to confirm your account"

#### ForgotPasswordForm.tsx
- Replace `handleSubmit` with call to `authContext.resetPassword()`
- Add error state and display error messages
- Keep existing success UI

### Protected Route Pattern
```typescript
// Any page that requires auth
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

## 5. TESTS

### Unit Tests (`__tests__/auth.test.ts`)

#### Supabase Client Tests
```typescript
describe('Supabase Client', () => {
  test('creates browser client with correct config', () => {
    const supabase = createClient();
    expect(supabase).toBeDefined();
  });
});
```

#### AuthContext Tests
```typescript
describe('AuthContext', () => {
  test('provides auth state to children', () => {
    // Mock Supabase client
    // Render AuthProvider with test child
    // Verify context values accessible
  });

  test('signUp creates user and sends confirmation', async () => {
    // Mock Supabase signUp
    // Call signUp from context
    // Verify called with correct params
  });

  test('signIn authenticates user', async () => {
    // Mock Supabase signInWithPassword
    // Call signIn from context
    // Verify session created
  });

  test('signInWithGoogle redirects to OAuth', async () => {
    // Mock Supabase signInWithOAuth
    // Call signInWithGoogle from context
    // Verify redirect initiated
  });

  test('signOut clears session', async () => {
    // Mock Supabase signOut
    // Call signOut from context
    // Verify user and session cleared
  });

  test('resetPassword sends email', async () => {
    // Mock Supabase resetPasswordForEmail
    // Call resetPassword from context
    // Verify email sent
  });
});
```

### Integration Tests (`__tests__/auth-integration.test.ts`)

#### Full Auth Flow Tests
```typescript
describe('Authentication Integration', () => {
  test('complete signup flow', async () => {
    // 1. Render signup form
    // 2. Fill out form with valid data
    // 3. Submit form
    // 4. Verify Supabase signUp called
    // 5. Verify success message shown
  });

  test('complete login flow', async () => {
    // 1. Render login form
    // 2. Fill email and password
    // 3. Submit form
    // 4. Verify Supabase signIn called
    // 5. Verify redirect to dashboard
  });

  test('complete forgot password flow', async () => {
    // 1. Render forgot password form
    // 2. Enter email
    // 3. Submit form
    // 4. Verify Supabase resetPassword called
    // 5. Verify success message shown
  });

  test('protected route redirects unauthenticated', async () => {
    // 1. Mock no auth session
    // 2. Navigate to protected route
    // 3. Verify redirect to login
  });

  test('session persists across page refresh', async () => {
    // 1. Login user
    // 2. Simulate page refresh
    // 3. Verify user still authenticated
  });
});
```

### Test Coverage Goals
- Auth context: >90%
- Auth forms: >80%
- Supabase utilities: >80%
- Middleware: >80%
- Overall: >80%

## 6. MANUAL TEST CHECKLIST

### Desktop Testing (Chrome, Firefox, Safari)

#### Email/Password Signup
- [ ] Can access signup page at `/signup`
- [ ] Form validates required fields
- [ ] Form validates password minimum length (8 chars)
- [ ] Form validates password confirmation match
- [ ] Successful signup shows success message
- [ ] Email confirmation sent (check inbox)
- [ ] Clicking confirmation link redirects to app
- [ ] User can login after confirmation
- [ ] Error messages display for invalid inputs
- [ ] Error messages display for duplicate email

#### Google OAuth Signup
- [ ] Can click "Continue with Google" button
- [ ] Redirects to Google consent screen
- [ ] After authorization, redirects back to app
- [ ] User is logged in automatically
- [ ] User profile includes Google name and avatar
- [ ] Session persists after page refresh

#### Email/Password Login
- [ ] Can access login page at `/login`
- [ ] Form validates required fields
- [ ] Successful login redirects to dashboard
- [ ] Error message for wrong password
- [ ] Error message for non-existent email
- [ ] "Show password" toggle works

#### Google OAuth Login
- [ ] Can click "Continue with Google" button
- [ ] Existing Google users login successfully
- [ ] New Google users create account automatically
- [ ] Session persists after page refresh

#### Forgot Password
- [ ] Can access forgot password page at `/forgot-password`
- [ ] Form validates email format
- [ ] Success message shows after submission
- [ ] Password reset email sent (check inbox)
- [ ] Reset link redirects to app
- [ ] Can set new password
- [ ] Can login with new password

#### Session Management
- [ ] Session persists after page refresh
- [ ] User info displayed in navigation when logged in
- [ ] Logout button visible when logged in
- [ ] Clicking logout clears session
- [ ] After logout, redirected to login page

#### Protected Routes
- [ ] Unauthenticated users redirected from `/dashboard`
- [ ] Unauthenticated users redirected from `/upload-resume`
- [ ] Authenticated users can access protected routes
- [ ] After login, redirected to originally requested page

### Mobile Testing (iOS Safari, Android Chrome)

#### Responsive Design
- [ ] Signup form displays correctly on mobile
- [ ] Login form displays correctly on mobile
- [ ] Forgot password form displays correctly on mobile
- [ ] Google OAuth button works on mobile
- [ ] Form inputs keyboard friendly
- [ ] Error messages readable on small screens

#### Functionality
- [ ] All desktop flows work on mobile
- [ ] Google OAuth works on mobile browsers
- [ ] Session persists on mobile
- [ ] Logout works on mobile

### Edge Cases
- [ ] Signup with already registered email shows error
- [ ] Login with unconfirmed email shows error
- [ ] Password reset for non-existent email (silent success for security)
- [ ] Expired session tokens refresh automatically
- [ ] Invalid OAuth callback handled gracefully
- [ ] Network error during auth shows user-friendly message
- [ ] Rapid form submissions prevented (loading state)
- [ ] XSS protection in error messages
- [ ] Special characters in passwords handled correctly

## 7. DEPLOYMENT CHECKLIST

### Pre-Deployment (Local)
- [ ] All environment variables set in `.env.local`
- [ ] Supabase project configured (email auth, Google OAuth)
- [ ] Google OAuth credentials configured in Supabase dashboard
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Manual testing completed

### Staging Deployment
- [ ] Set environment variables in Vercel
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Update Supabase redirect URLs to include staging URL
- [ ] Deploy to staging
- [ ] Run smoke tests:
  - [ ] Signup with email/password
  - [ ] Login with email/password
  - [ ] Google OAuth signup
  - [ ] Google OAuth login
  - [ ] Logout
  - [ ] Session persistence
- [ ] Verify email confirmations sent
- [ ] Verify password reset emails sent

### Production Deployment
- [ ] Staging validated successfully
- [ ] Update Supabase redirect URLs to production domain
- [ ] Update site URL in Supabase to production domain
- [ ] Enable email confirmations in Supabase (if not already)
- [ ] Deploy to production
- [ ] Run smoke tests:
  - [ ] Signup with email/password
  - [ ] Login with email/password
  - [ ] Google OAuth signup
  - [ ] Google OAuth login
  - [ ] Logout
  - [ ] Session persistence
- [ ] Monitor error logs for first 24 hours
- [ ] Verify email deliverability in production

### Post-Deployment
- [ ] Update plan.md to mark F-001 as Done
- [ ] Create implementation summary document
- [ ] Document any issues encountered and solutions
- [ ] Update README with auth documentation

## SECURITY CONSIDERATIONS

### Implemented Security Measures
1. **Row Level Security (RLS)**: Will be implemented in future features when custom tables added
2. **HTTPS Only**: Enforced in production
3. **Secure Cookies**: Supabase uses httpOnly, secure, sameSite cookies
4. **CSRF Protection**: Built into Supabase Auth
5. **Email Verification**: Required for signup (production)
6. **Password Requirements**: Minimum 8 characters
7. **OAuth State Validation**: Handled by Supabase
8. **Token Refresh**: Automatic via middleware
9. **XSS Protection**: React escapes by default, validation on inputs
10. **Rate Limiting**: Provided by Supabase (60 requests/hour per IP)

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://ntnxzhhbevmdxskaqomf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# Optional (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Google OAuth Setup
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://ntnxzhhbevmdxskaqomf.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase dashboard

## IMPLEMENTATION NOTES

### Key Dependencies
- `@supabase/supabase-js`: ^2.39.0 - Core Supabase client
- `@supabase/ssr`: ^0.1.0 - SSR helpers for Next.js

### File Size Estimates
- `lib/supabase/client.ts`: ~20 lines
- `lib/supabase/server.ts`: ~40 lines
- `lib/supabase/middleware.ts`: ~30 lines
- `contexts/AuthContext.tsx`: ~200 lines
- `app/auth/callback/route.ts`: ~50 lines
- `middleware.ts`: ~80 lines
- Updated forms: ~50 lines each

### Development Timeline Estimate
- Setup & Configuration: 1 hour
- Supabase Client Utils: 1 hour
- Auth Context: 2 hours
- Update Forms: 2 hours
- OAuth Callback: 1 hour
- Middleware: 2 hours
- Testing: 3 hours
- Documentation: 1 hour
- **Total: ~13 hours**

### Testing Strategy
1. Write unit tests alongside implementation
2. Write integration tests after all components complete
3. Manual testing on desktop (all browsers)
4. Manual testing on mobile (iOS + Android)
5. Edge case testing
6. Load testing (if needed)

### Rollback Plan
If issues in production:
1. Revert deployment in Vercel
2. Keep Supabase configuration (no schema changes to rollback)
3. Investigate issues in staging
4. Fix and redeploy

## FUTURE ENHANCEMENTS (Not in F-001)
- Magic link authentication
- Social auth (GitHub, Twitter, etc.)
- Multi-factor authentication (MFA)
- Account deletion
- Email change flow
- Password strength meter
- Remember me functionality
- Session timeout warnings
- Audit logs for auth events
- Admin dashboard for user management
