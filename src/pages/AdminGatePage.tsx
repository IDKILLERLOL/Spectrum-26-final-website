import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { logGateFailure } from '../lib/firestore';
import { getTheme, toggleTheme as triggerToggleTheme } from '../lib/theme';

type GateStep = 'password' | 'google';

export function AdminGatePage() {
  console.log("[Mount] AdminGatePage component loaded");
  const navigate = useNavigate();
  const { isAdmin, verifyAdminPassword, adminLoginWithGoogle } = useAuth();
  const [theme, setTheme] = useState(getTheme);

  const handleToggleTheme = useCallback(() => {
    triggerToggleTheme(theme, (nextTheme) => {
      setTheme(nextTheme);
    });
  }, [theme]);

  // If already admin, skip gate
  useEffect(() => {
    if (isAdmin) navigate('/supercore/registrations', { replace: true });
  }, [isAdmin, navigate]);

  const [step, setStep] = useState<GateStep>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lockout countdown
  useEffect(() => {
    if (lockoutUntil == null) return;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current!);
        setLockoutUntil(null);
        setError(null);
      }
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [lockoutUntil]);

  const getClientIp = async (): Promise<string | null> => {
    try {
      const r = await fetch('https://api.ipify.org?format=json');
      const j = await r.json();
      return j.ip ?? null;
    } catch {
      return null;
    }
  };

  // ─── Step 1: password ───────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil) return;
    setError(null);
    setLoading(true);

    const ip = await getClientIp();
    const ok = verifyAdminPassword(password);

    if (!ok) {
      await logGateFailure(ip);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        // Lockout for 5 minutes after 5 consecutive failures
        const until = Date.now() + 5 * 60 * 1000;
        setLockoutUntil(until);
        setTimeLeft(300);
        setError('Too many failed attempts. Locked for 5 minutes.');
      } else {
        setError(`Incorrect password. ${5 - newAttempts} attempt(s) remaining.`);
      }
      setPassword('');
    } else {
      setAttempts(0);
      setStep('google');
    }
    setLoading(false);
  };

  // ─── Step 2: Google OAuth + whitelist ───────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await adminLoginWithGoogle();
      if (result.ok) {
        navigate('/supercore/registrations', { replace: true });
      } else {
        setError(result.error);
        if (result.error.includes('not an authorised admin')) setStep('password');
      }
    } catch {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className=""
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div className="">
        {/* Header */}
        <div className="">
          <span className="">SPECTRUM 26</span>
          <span className="">Admin Access</span>
        </div>

        {/* Progress dots */}
        <div className="">
          <div className="" />
          <div
            className=""
            style={{
              background: step === 'google' ? 'var(--color-text-primary)' : 'transparent',
              borderColor: 'var(--color-text-primary)',
            }}
          />
          <div className="" style={{ background: 'var(--color-border-default)' }} />
          <span className="">
            Step {step === 'password' ? '1' : '2'} of 2
          </span>
        </div>

        {/* Card */}
        <div
          className=""
          style={{
            background: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-default)',
          }}
        >
          <AnimatePresence mode="wait">
            {step === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className=""
              >
                <div className="">
                  <h1 className="">
                    Enter Gate Password
                  </h1>
                  <p className="">
                    Shared password required before Google sign-in.
                  </p>
                </div>

                {lockoutUntil ? (
                  <div className="">
                    <AlertCircle size={16} className="" />
                    Locked. Try again in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="">
                    <div className="">
                      <label className="">Password</label>
                      <div className="">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••"
                          required
                          autoFocus
                          className=""
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className=""
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="">
                        <AlertCircle size={14} className="" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !password}
                      className=""
                    >
                      {loading && <Loader2 size={14} className="" />}
                      Continue
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {step === 'google' && (
              <motion.div
                key="google"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className=""
              >
                <div className="">
                  <h2 className="">
                    Sign in with Google
                  </h2>
                  <p className="">
                    Your Google account must be on the admin whitelist.
                  </p>
                </div>

                {error && (
                  <div className="">
                    <AlertCircle size={14} className="" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className=""
                >
                  {loading ? (
                    <Loader2 size={16} className="" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>


                <button
                  onClick={() => { setStep('password'); setError(null); }}
                  className=""
                >
                  ← Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="">
          Failed attempts are logged to the audit trail.
        </p>
      </div>
    </main>
  );
}
