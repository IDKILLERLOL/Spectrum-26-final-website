import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getUser, updateUser } from '../lib/firestore';
import { notifyEmailChanged } from '../lib/email';
import type { User } from '../types';

export function ProfilePage() {
  console.log("[Mount] ProfilePage component loaded");
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
      <main className="">
        <div className="" />
        <div className="">
          {[1, 2, 3].map((i) => <div key={i} className="" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <header className="">
        <h1 className="">
          Profile
        </h1>
        <p className="">
          These are your <em>account-level</em> details. Your name and contact info on existing registrations are separate and must be edited from each event pass.
        </p>
      </header>

      {redirectMessage && (
        <div
          className=""
        >
          <span className="">IMPORTANT:</span>
          <span>{redirectMessage}</span>
        </div>
      )}


      <div className="">
        <form onSubmit={handleSave} className="">
          <div className="">
            {[
              { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your full name' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone', value: phone, setter: setPhone, type: 'tel', placeholder: '+91 9876543210' },
              { label: 'College', value: college, setter: setCollege, type: 'text', placeholder: 'e.g. IIT Bombay' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label} className="">
                <label className="">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className=""
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className=""
          >
            {saving && <Loader2 size={14} className="" />}
            {saved ? '✓ Saved' : <><Save size={14} /> Save Changes</>}
          </button>
        </form>

        {/* Account meta */}
        <div className="">
          <div className="">
            <span className="">Auth Method</span>
            <span className="">{profile?.authMethod ?? 'google'}</span>
          </div>
          <div className="">
            <span className="">Account ID</span>
            <span className="">{user?.uid?.slice(0, 16)}…</span>
          </div>
          <button
            onClick={handleLogout}
            className=""
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
