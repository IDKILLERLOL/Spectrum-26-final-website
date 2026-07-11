import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getUser, updateUser } from '../lib/firestore';
import { notifyEmailChanged } from '../lib/email';
import type { User } from '../types';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');

  const redirectMessage = (location.state as { message?: string })?.message;
  const redirectTo = (location.state as { from?: string })?.from;

  useEffect(() => {
    if (!user) return;
    getUser(user.uid)
      .then((u) => {
        setProfile(u);
        if (u) { setName(u.name); setPhone(u.phone); setEmail(u.email); setCollege(u.college ?? ''); }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!name.trim() || !phone.trim()) {
      setError('Full Name and Phone Number are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const emailChanged = email !== profile.email;
      await updateUser(user.uid, { name, phone, email, college });
      if (emailChanged) {
        await notifyEmailChanged(profile.email, email);
      }
      setProfile((p) => p ? { ...p, name, phone, email, college } : p);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        }
      }, 1500);
    } catch {
      setError('Failed to save changes. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen flex flex-col py-8 px-6 max-w-7xl mx-auto gap-14">
        <div className="skeleton h-14 w-56 rounded border-b-2 border-primary pb-8" />
        <div className="flex flex-col gap-6 max-w-lg">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full rounded" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen flex flex-col py-8 px-6 max-w-7xl mx-auto gap-14 md:gap-24">
      <header className="flex flex-col gap-6 border-b-2 border-primary pb-8">
        <h1 className="font-hero text-[48px] md:text-[64px] leading-none uppercase tracking-widest text-primary">
          Profile
        </h1>
        <p className="font-body text-body text-text-secondary max-w-2xl">
          These are your <em>account-level</em> details. Your name and contact info on existing registrations are separate and must be edited from each event pass.
        </p>
      </header>

      {redirectMessage && (
        <div
          className="p-4 border-2 border-primary font-body text-small text-primary bg-bg-elevated flex items-start gap-3 max-w-2xl"
        >
          <span className="shrink-0 font-bold font-micro">IMPORTANT:</span>
          <span>{redirectMessage}</span>
        </div>
      )}


      <div className="flex flex-col md:flex-row gap-12 md:gap-24 max-w-3xl">
        <form onSubmit={handleSave} className="flex flex-col gap-8 flex-1">
          <div className="flex flex-col gap-6">
            {[
              { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your full name' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone', value: phone, setter: setPhone, type: 'tel', placeholder: '+91 9876543210' },
              { label: 'College', value: college, setter: setCollege, type: 'text', placeholder: 'e.g. IIT Bombay' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label} className="flex flex-col gap-2">
                <label className="font-micro text-micro text-text-muted uppercase tracking-widest">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="bg-transparent border-b-2 border-border-strong text-primary font-heading text-heading py-2 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="font-body text-small text-text-secondary border border-dashed border-border-default px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-primary text-bg-base font-button text-button uppercase py-4 px-8 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saved ? '✓ Saved' : <><Save size={14} /> Save Changes</>}
          </button>
        </form>

        {/* Account meta */}
        <div className="flex flex-col gap-8 min-w-[200px]">
          <div className="flex flex-col gap-2">
            <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Auth Method</span>
            <span className="font-heading text-heading text-primary uppercase">{profile?.authMethod ?? 'google'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-micro text-micro text-text-muted uppercase tracking-widest">Account ID</span>
            <span className="font-body text-small text-text-muted font-mono break-all">{user?.uid?.slice(0, 16)}…</span>
          </div>
          <button
            onClick={handleLogout}
            className="font-button text-button text-text-secondary border border-dashed border-border-default px-6 py-3 hover:border-primary hover:text-primary transition-colors uppercase tracking-wide w-max"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
