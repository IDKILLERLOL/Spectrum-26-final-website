import { signInAnonymously } from 'firebase/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { upsertUser, getMyRegistrations, getUser, linkMemberToUser, db } from '../lib/firestore';
import { sendWelcomeEmail } from '../lib/email';
import { auth } from '../lib/auth';
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
  console.log("[Mount] LoginPage component loaded");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle, setOtpUser } = useAuth();

  // Read intent from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectIntent = searchParams.get('redirect');
  const targetEventId = searchParams.get('eventId');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stateMsg = location.state?.message;
  const stateEmail = location.state?.email;

  useEffect(() => {
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [stateEmail]);

  // --- Routing Logic ---
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

  // Run routing check immediately if user is already logged in when landing on /login
  useEffect(() => {
    if (user) {
      handleStep6Routing(user.uid, user.email ?? undefined);
    }
  }, [user, redirectIntent, targetEventId]);

  // --- Google Sign-in Flow ---
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

  // --- Custom Email Sign In Flow ---
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      // 1. Query Firestore for the user by email
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert('Account not found. Please register for an event on the landing page first to create your account!');
        navigate('/', { replace: true });
        setLoading(false);
        return;
      }

      const dbUserRecord = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;

      // 2. Validate Password
      const inputHash = hashPassword(password, email.trim().toLowerCase());
      if (inputHash !== dbUserRecord.passwordHash) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Authenticate current session anonymously
      const { user: anonUser } = await signInAnonymously(auth);

      // 4. Move user record & link teammate records in parallel
      if (anonUser.uid !== dbUserRecord.id) {
        const oldUserRef = doc(db, 'users', dbUserRecord.id);
        const newUserRef = doc(db, 'users', anonUser.uid);
        const { id, ...userData } = dbUserRecord;

        await Promise.all([
          setDoc(newUserRef, {
            ...userData,
            lastLoginAt: serverTimestamp(),
          }),
          deleteDoc(oldUserRef),
          linkMemberToUser(email.trim().toLowerCase(), anonUser.uid)
        ]);
      }

      setOtpUser(anonUser);
      await handleStep6Routing(anonUser.uid, email.trim().toLowerCase());
    } catch (err) {
      console.error('[login] Email login error:', err);
      setError('Login failed. Please try again.');
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
          <div className="border-b border-border-default pb-3 text-center">
            <h2 className="font-heading text-card-title uppercase tracking-wide text-primary">
              Authenticate Account
            </h2>
          </div>

          {stateMsg && (
            <div
              className="p-3 border border-dashed text-xs font-semibold text-center leading-relaxed"
              style={{
                borderColor: '#10b981',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.05)',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {stateMsg}
            </div>
          )}

          <div className="flex flex-col gap-8">
            {/* Google Sign In */}
            <div className="flex flex-col gap-2">
              <span className="text-micro font-body uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Quick Authentication
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

            {/* Custom Email Form */}
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
              <span className="text-micro font-body uppercase tracking-widest text-left" style={{ color: 'var(--color-text-muted)' }}>
                Email Sign In
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (you@example.com)"
                required
                className="bg-transparent border-b py-2 focus:outline-none transition-all text-body font-body w-full"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="bg-transparent border-b py-2 focus:outline-none transition-all text-body font-body w-full"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-button text-button uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                style={{
                  background: 'var(--color-text-primary)',
                  color: 'var(--color-bg-base)',
                  borderRadius: '6px',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
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
