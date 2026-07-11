import { signInAnonymously } from 'firebase/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { requestOtp, verifyOtp } from '../lib/otp';
import { upsertUser, getMyRegistrations, getUser, linkMemberToUser } from '../lib/firestore';
import { auth } from '../lib/auth';
import { sendWelcomeEmail } from '../lib/email';
import { db } from '../lib/firestore';
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

function hashPassword(password: string, email: string): string {
  const str = `${email}::${password}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // 32-bit
  }
  return (hash >>> 0).toString(16);
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle, setOtpUser } = useAuth();

  // Read intent from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectIntent = searchParams.get('redirect');
  const targetEventId = searchParams.get('eventId');

  // --- Form, OTP, and Password States ---
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dbUserRecord, setDbUserRecord] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'email' | 'code' | 'password' | 'create_password'>('email');

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // --- Step 6 Routing Logic ---
  const handleStep6Routing = async (uid: string, userEmail?: string) => {
    if (redirectIntent === 'register' && targetEventId) {
      navigate(`/register/${targetEventId}`, { replace: true });
      return;
    }

    try {
      const regs = await getMyRegistrations(uid, userEmail);
      if (regs.length === 0) {
        navigate('/', { replace: true });
      } else {
        navigate('/my-registrations', { replace: true });
      }
    } catch (err) {
      console.error('[login] Routing error:', err);
      navigate('/', { replace: true });
    }
  };

  // Run Step 6 check immediately if user is already logged in when landing on /login
  useEffect(() => {
    if (user) {
      handleStep6Routing(user.uid, user.email ?? undefined);
    }
  }, [user, redirectIntent, targetEventId]);

  // --- Step 4A: Google Sign-in Flow ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const gUser = await loginWithGoogle();
      if (gUser) {
        const dbUser = await getUser(gUser.uid);
        if (!dbUser) {
          await upsertUser(
            gUser.uid,
            gUser.email ?? '',
            gUser.displayName ?? '',
            'google'
          );
          if (gUser.email) {
            sendWelcomeEmail(gUser.email, gUser.displayName ?? '').catch(console.error);
          }
        }
        if (gUser.email) {
          await linkMemberToUser(gUser.email, gUser.uid);
        }
        await handleStep6Routing(gUser.uid, gUser.email ?? undefined);
      }
    } catch (err: unknown) {
      const e = err as { code?: string };
      const cancelled = e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request';
      if (!cancelled) {
        console.error('[login] Google Sign-In error:', err);
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4B: Check Email (OTP or Password redirection) ---
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const foundUser = snap.docs[0].data();
        const foundUserId = snap.docs[0].id;
        const foundUserObj = { id: foundUserId, ...foundUser };
        
        if (foundUser.passwordHash) {
          setDbUserRecord(foundUserObj);
          setOtpStep('password');
          setLoading(false);
          return;
        }
      }

      // First login - Send OTP
      const result = await requestOtp(email.trim());
      if (result.ok === true) {
        startCooldown();
        if (result.devCode) setDevCode(result.devCode);
        setOtpStep('code');
      } else {
        const errResult = result as { ok: false; error: string; retryAfter: number };
        if (errResult.error === 'cooldown') {
          setError(`Please wait before requesting another code.`);
        } else if (errResult.error === 'rate_limited') {
          setError(`Too many requests. Try again in ${Math.ceil(errResult.retryAfter / 60)} min.`);
        }
      }
    } catch (err) {
      console.error('[login] Check email error:', err);
      setError('Failed to request code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 5: Verify Code (New User OTP) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const result = await verifyOtp(email.trim(), code);
      if (result.ok) {
        setOtpStep('create_password');
      } else {
        setError('Incorrect code.');
      }
    } catch (err) {
      console.error('[login] Verify OTP error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 5B: Create Password (1st login verification submission) ---
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      let activeUser = auth.currentUser;
      if (!activeUser) {
        const { user: anonUser } = await signInAnonymously(auth);
        activeUser = anonUser;
      }

      const passHash = hashPassword(password, email.trim());
      const userRef = doc(db, 'users', activeUser.uid);
      const data = {
        email: email.trim(),
        name: name.trim() || email.trim().split('@')[0],
        phone: '',
        authMethod: 'otp' as const,
        createdAt: serverTimestamp(),
        college: '',
        passwordHash: passHash,
      };
      await setDoc(userRef, data);

      sendWelcomeEmail(email.trim(), data.name).catch(console.error);
      await linkMemberToUser(email.trim(), activeUser.uid);

      setOtpUser(activeUser);
      await handleStep6Routing(activeUser.uid, email.trim());
    } catch (err) {
      console.error('[login] Create password error:', err);
      setError('Failed to create password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 5C: Password Login (Returning Users) ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError(null);
    setLoading(true);
    try {
      if (!dbUserRecord) throw new Error('No user record found');

      const inputHash = hashPassword(password, email.trim());
      if (inputHash === dbUserRecord.passwordHash) {
        const { user: anonUser } = await signInAnonymously(auth);
        
        const oldUserRef = doc(db, 'users', dbUserRecord.id);
        const newUserRef = doc(db, 'users', anonUser.uid);
        
        const oldSnap = await getDoc(oldUserRef);
        if (oldSnap.exists()) {
          const oldData = oldSnap.data();
          await setDoc(newUserRef, {
            ...oldData,
            lastLoginAt: serverTimestamp(),
          });
          await deleteDoc(oldUserRef);
        }

        await linkMemberToUser(email.trim(), anonUser.uid);

        setOtpUser(anonUser);
        await handleStep6Routing(anonUser.uid, email.trim());
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error('[login] Password sign-in error:', err);
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCode('');
    setError(null);
    setLoading(true);
    try {
      const result = await requestOtp(email.trim());
      if (result.ok) {
        startCooldown();
        if (result.devCode) setDevCode(result.devCode);
      } else {
        setError('Could not resend. Please try again later.');
      }
    } catch {
      setError('Failed to resend. Try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div className="w-full max-w-md flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="font-hero tracking-widest uppercase text-xl md:text-2xl hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SPECTRUM 26
          </Link>
          <p className="text-body font-body" style={{ color: 'var(--color-text-secondary)' }}>
            {redirectIntent === 'register' 
              ? 'Step 1: Authenticate your account before entering participant details.' 
              : 'Sign in to register for events and manage your team.'}
          </p>
        </div>

        {/* Card */}
        <div
          className="p-8 border flex flex-col gap-8"
          style={{
            background: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-default)',
            borderRadius: '8px',
          }}
        >
          <h1
            className="text-card-title font-heading uppercase tracking-wide border-b border-border-default pb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {redirectIntent === 'register' ? 'Register' : 'Sign In'}
          </h1>

          {/* BOTH Options Google and Email live on this same page and are always visible */}
          <div className="flex flex-col gap-8">
            {/* Option A: Google Sign In */}
            <div className="flex flex-col gap-2">
              <span className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                {redirectIntent === 'register' ? 'Option A: Quick Register with Google' : 'Option A: Continue with Google'}
              </span>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 border font-button text-button uppercase tracking-wide transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-text-primary)',
                  background: 'transparent',
                  borderRadius: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {redirectIntent === 'register' ? 'Continue with Google' : 'Sign in with Google'}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex-1 h-px" style={{ background: 'var(--color-border-default)' }} />
              or
              <div className="flex-1 h-px" style={{ background: 'var(--color-border-default)' }} />
            </div>

            {/* Option B: Email/Password login */}
            <div className="flex flex-col gap-2">
              <span className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                {redirectIntent === 'register' ? 'Option B: Register with Email' : 'Option B: Email Login'}
              </span>

              {otpStep === 'email' && (
                <form onSubmit={handleCheckEmail} className="flex flex-col gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-transparent border-b py-2 focus:outline-none transition-all text-body font-body w-full"
                    style={{
                      borderColor: 'var(--color-border-strong)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-4 font-button text-button uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{
                      background: 'var(--color-text-primary)',
                      color: 'var(--color-bg-base)',
                      borderRadius: '6px',
                    }}
                  >
                    {loading ? 'Processing...' : 'Continue'}
                  </button>
                </form>
              )}

              {otpStep === 'code' && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-small font-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Code sent to {email}.
                    </span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    autoFocus
                    className="bg-transparent border-b py-2 focus:outline-none transition-all font-mono tracking-[0.5em] text-xl w-full text-center"
                    style={{
                      borderColor: 'var(--color-border-strong)',
                      color: 'var(--color-text-primary)',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="w-full py-4 font-button text-button uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{
                      background: 'var(--color-text-primary)',
                      color: 'var(--color-bg-base)',
                      borderRadius: '6px',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                    className="flex items-center justify-center gap-2 text-small font-body transition-opacity hover:opacity-70 disabled:opacity-40 animate-pulse"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <RefreshCw size={13} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setCode(''); setError(null); }}
                    className="text-small font-body text-text-muted hover:text-primary transition-colors text-left self-start mt-2"
                  >
                    ← Change Email
                  </button>
                </form>
              )}

              {otpStep === 'password' && (
                <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-small font-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Enter your password for {email}.
                    </span>
                  </div>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    className="bg-transparent border-b py-2 focus:outline-none transition-all text-body font-body w-full"
                    style={{
                      borderColor: 'var(--color-border-strong)',
                      color: 'var(--color-text-primary)',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full py-4 font-button text-button uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{
                      background: 'var(--color-text-primary)',
                      color: 'var(--color-bg-base)',
                      borderRadius: '6px',
                    }}
                  >
                    {loading ? 'Logging In...' : 'Log In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpStep('email'); setPassword(''); setError(null); }}
                    className="text-small font-body text-text-muted hover:text-primary transition-colors text-left self-start mt-2"
                  >
                    ← Change Email
                  </button>
                </form>
              )}

              {otpStep === 'create_password' && (
                <form onSubmit={handleCreatePassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-small font-body" style={{ color: 'var(--color-text-secondary)' }}>
                      Create a password for your account. You will use this password for all future sign-ins.
                    </span>
                  </div>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="bg-transparent border-b py-2 focus:outline-none transition-all text-body font-body w-full mb-2"
                    style={{
                      borderColor: 'var(--color-border-strong)',
                      color: 'var(--color-text-primary)',
                    }}
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose Password (Min 6 chars)"
                    required
                    autoFocus
                    className="bg-transparent border-b py-2 focus:outline-none transition-all text-body font-body w-full"
                    style={{
                      borderColor: 'var(--color-border-strong)',
                      color: 'var(--color-text-primary)',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading || password.length < 6}
                    className="w-full py-4 font-button text-button uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{
                      background: 'var(--color-text-primary)',
                      color: 'var(--color-bg-base)',
                      borderRadius: '6px',
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Password & Log In'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {error && <ErrorMsg msg={error} />}
        </div>
      </div>
    </main>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div
      className="flex items-start gap-2 text-small font-body p-3 border"
      style={{
        borderColor: 'var(--color-border-default)',
        borderStyle: 'dashed',
        color: 'var(--color-text-secondary)',
        borderRadius: '6px',
      }}
    >
      <AlertCircle size={14} className="shrink-0 mt-0.5" />
      {msg}
    </div>
  );
}
