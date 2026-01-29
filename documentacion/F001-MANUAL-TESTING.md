# F-001 MANUAL TESTING CHECKLIST

## IMPORTANT: Before Testing

You MUST add your Supabase anon key to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

Get your anon key from: https://supabase.com/dashboard/project/ntnxzhhbevmdxskaqomf/settings/api

## Prerequisites

1. Supabase project configured:
   - Email auth enabled
   - Email confirmations enabled (or disabled for dev)
   - Google OAuth configured (optional for now)

2. Environment variables set in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://ntnxzhhbevmdxskaqomf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Development server running:
   ```bash
   npm run dev
   ```

## Desktop Testing (Chrome, Firefox, Safari)

### 1. Email/Password Signup
- [ ] Navigate to http://localhost:3000/signup
- [ ] Form displays correctly with all fields
- [ ] Fill in: Name, Email, Password (min 8 chars), Confirm Password
- [ ] Click "Crear Cuenta"
- [ ] Loading spinner shows during request
- [ ] Success message: "Revisa tu email"
- [ ] Check email inbox for confirmation (if enabled)
- [ ] Click confirmation link in email
- [ ] Redirects to app logged in

**Error Cases:**
- [ ] Empty fields show browser validation
- [ ] Password < 8 characters shows error
- [ ] Passwords don't match shows error
- [ ] Duplicate email shows Supabase error message
- [ ] Network error shows user-friendly message

### 2. Email/Password Login
- [ ] Navigate to http://localhost:3000/login
- [ ] Form displays correctly
- [ ] Fill in: Email, Password
- [ ] Click "Iniciar Sesion"
- [ ] Loading spinner shows during request
- [ ] Redirects to /dashboard on success
- [ ] Dashboard shows user name/email
- [ ] User info visible in navigation

**Error Cases:**
- [ ] Wrong password shows error message
- [ ] Non-existent email shows error message
- [ ] Unconfirmed email shows error (if confirmations enabled)
- [ ] Empty fields show browser validation

**Password Toggle:**
- [ ] Click eye icon to show password
- [ ] Click eye icon again to hide password
- [ ] Password visibility toggles correctly

**Forgot Password Link:**
- [ ] Click "Olvidaste tu contrasena?" link
- [ ] Redirects to /forgot-password

### 3. Google OAuth (Optional - requires setup)
- [ ] On signup page, click "Google" button
- [ ] Redirects to Google consent screen
- [ ] Authorize app
- [ ] Redirects back to app via /auth/callback
- [ ] User logged in automatically
- [ ] Dashboard shows Google profile name
- [ ] Profile includes avatar (if available)

**Login with Google:**
- [ ] Logout first
- [ ] On login page, click "Google" button
- [ ] Existing Google user logs in successfully
- [ ] New Google user creates account automatically

### 4. Forgot Password Flow
- [ ] Navigate to http://localhost:3000/forgot-password
- [ ] Form displays correctly
- [ ] Enter registered email
- [ ] Click "Enviar enlace"
- [ ] Loading spinner shows during request
- [ ] Success UI shows
- [ ] Success message displays email address
- [ ] Check email for password reset link
- [ ] Click reset link in email
- [ ] Should redirect to callback (recovery flow)

**Error Cases:**
- [ ] Empty email shows browser validation
- [ ] Invalid email format shows validation error
- [ ] Non-existent email silently succeeds (security)

### 5. Session Persistence
- [ ] Login successfully
- [ ] Navigate to /dashboard
- [ ] Refresh page (F5)
- [ ] User still logged in
- [ ] Dashboard still displays user info
- [ ] Close browser tab
- [ ] Open new tab to http://localhost:3000/dashboard
- [ ] User still logged in

### 6. Logout
- [ ] While logged in, click "Cerrar sesion" button
- [ ] User logged out
- [ ] Redirects to /login
- [ ] Try accessing /dashboard
- [ ] Redirects to /login (protected route)

### 7. Protected Routes
**While NOT logged in:**
- [ ] Try accessing /dashboard
- [ ] Redirects to /login
- [ ] URL error parameter shown (optional)

**While logged in:**
- [ ] Can access /dashboard
- [ ] Can access /upload
- [ ] Can access /analyze-job
- [ ] Can access /adapt-resume

### 8. Navigation Updates
**When NOT logged in:**
- [ ] Landing page shows "Iniciar sesion" link
- [ ] Landing page shows "Comenzar" button
- [ ] No user info visible
- [ ] No logout button

**When logged in:**
- [ ] Landing page shows user name/email
- [ ] Landing page shows "Cerrar sesion" button
- [ ] "Iniciar sesion" link hidden
- [ ] "Dashboard" link visible

## Mobile Testing (iOS Safari, Android Chrome)

### 9. Responsive Design
- [ ] Open http://localhost:3000/signup on mobile
- [ ] Form displays correctly, not cut off
- [ ] Input fields are touch-friendly
- [ ] Buttons are large enough to tap
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling

**Login Page:**
- [ ] Form displays correctly on mobile
- [ ] Password toggle works on mobile
- [ ] All links tappable

**Dashboard:**
- [ ] Dashboard displays correctly on mobile
- [ ] User info readable
- [ ] Quick action cards stack vertically
- [ ] Logout button accessible

### 10. Mobile Functionality
- [ ] Can sign up from mobile device
- [ ] Can log in from mobile device
- [ ] Can request password reset from mobile
- [ ] Session persists on mobile
- [ ] Can logout from mobile
- [ ] Navigation works on mobile
- [ ] Protected routes redirect on mobile

### 11. Mobile Keyboard
- [ ] Email field triggers email keyboard
- [ ] Password field hides input
- [ ] Form doesn't break with keyboard open
- [ ] Submit button accessible with keyboard open

## Edge Cases

### 12. Multiple Tabs/Windows
- [ ] Login in tab 1
- [ ] Open tab 2
- [ ] Tab 2 reflects logged in state
- [ ] Logout in tab 1
- [ ] Tab 2 reflects logged out state (may require refresh)

### 13. Expired Session
- [ ] Login successfully
- [ ] Wait for session to expire (or manually delete cookies)
- [ ] Try accessing protected route
- [ ] Session refreshes automatically OR redirects to login

### 14. Network Errors
- [ ] Disable network in browser DevTools
- [ ] Try to login
- [ ] User-friendly error message shown
- [ ] Re-enable network
- [ ] Login works normally

### 15. Special Characters
- [ ] Password with special chars: !@#$%^&*()
- [ ] Password with unicode: café, 你好
- [ ] Email with + symbol: user+test@example.com
- [ ] All work correctly

### 16. Form State
- [ ] Fill signup form halfway
- [ ] Navigate away
- [ ] Navigate back
- [ ] Form is empty (no stale state)
- [ ] Fill form completely
- [ ] Submit with error
- [ ] Form data preserved after error

### 17. Rapid Submissions
- [ ] Try clicking signup button multiple times rapidly
- [ ] Button disabled during request (loading state)
- [ ] Only one request sent
- [ ] Button re-enabled after response

### 18. XSS Protection
- [ ] Try email: `<script>alert('xss')</script>@test.com`
- [ ] Try name: `<img src=x onerror=alert('xss')>`
- [ ] No script execution
- [ ] Error messages don't execute scripts

## Browser Compatibility

### 19. Chrome Desktop
- [ ] All features work
- [ ] No console errors
- [ ] UI displays correctly

### 20. Firefox Desktop
- [ ] All features work
- [ ] No console errors
- [ ] UI displays correctly

### 21. Safari Desktop
- [ ] All features work
- [ ] No console errors
- [ ] UI displays correctly

### 22. Mobile Safari (iOS)
- [ ] All features work
- [ ] No console errors
- [ ] Touch interactions smooth

### 23. Chrome Mobile (Android)
- [ ] All features work
- [ ] No console errors
- [ ] Touch interactions smooth

## Performance

### 24. Load Times
- [ ] Login page loads < 2 seconds
- [ ] Signup page loads < 2 seconds
- [ ] Dashboard loads < 3 seconds after login
- [ ] No layout shift during load

### 25. Auth Operations
- [ ] Signup completes < 3 seconds
- [ ] Login completes < 2 seconds
- [ ] Logout completes < 1 second
- [ ] Password reset email sent < 2 seconds

## Security

### 26. Password Visibility
- [ ] Password hidden by default
- [ ] Toggle shows/hides correctly
- [ ] Password not visible in URL
- [ ] Password not visible in network tab (check Supabase handles this)

### 27. Session Security
- [ ] Session token in httpOnly cookie (check in DevTools)
- [ ] No auth token visible in localStorage
- [ ] Session expires appropriately
- [ ] HTTPS enforced in production (check in staging)

### 28. Error Messages
- [ ] Error messages don't leak sensitive info
- [ ] Error messages are user-friendly
- [ ] Different users get same error for non-existent email (security)

## Accessibility (Bonus)

### 29. Keyboard Navigation
- [ ] Can tab through all form fields
- [ ] Can submit form with Enter key
- [ ] Focus indicators visible
- [ ] Logical tab order

### 30. Screen Reader (Bonus)
- [ ] Form labels announced correctly
- [ ] Error messages announced
- [ ] Button states announced
- [ ] Success messages announced

## Test Results

Date tested: ___________
Tester: ___________
Browser: ___________
Device: ___________

**Pass Rate:** ____ / 30 sections

**Critical Issues Found:**
1.
2.
3.

**Minor Issues Found:**
1.
2.
3.

**Notes:**

