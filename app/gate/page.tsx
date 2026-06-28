'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface VerificationResult {
  success: boolean;
  data?: {
    name: string;
    eventName: string;
    college: string;
    phone: string;
  };
  error?: string;
  message?: string;
}

export default function GatePage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [passCode, setPassCode] = useState('');
  const [location, setLocation] = useState('Main Gate');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    router.push('/');
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/gate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passCode: passCode.toUpperCase().trim(),
          location,
          verifiedBy: user.email,
        }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success(`Welcome ${result.data.name}!`);
        setPassCode('');
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Error verifying pass');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Gate Verification</h1>
            <p className="text-[#999999] mt-2">Verify attendees with their pass codes</p>
          </div>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Admin Panel
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="bg-[#111111] border border-[#333333] rounded-xl p-8 space-y-6">
          <div>
            <label htmlFor="passCode" className="block text-sm font-bold text-white mb-2">
              Pass Code
            </label>
            <input
              type="text"
              id="passCode"
              placeholder="Enter 8-character pass code"
              value={passCode}
              onChange={(e) => setPassCode(e.target.value.toUpperCase())}
              autoFocus
              className="w-full bg-[#0d0d0d] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] text-2xl tracking-widest font-mono text-center focus:outline-none focus:border-white"
              maxLength={8}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-bold text-white mb-2">
              Gate Location
            </label>
            <input
              type="text"
              id="location"
              placeholder="e.g., Main Gate, South Entrance"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-white"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !passCode.trim()}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Verifying...
              </div>
            ) : (
              'Verify Pass'
            )}
          </Button>
        </form>

        {/* Last Result */}
        {lastResult && (
          <div
            className={`rounded-xl p-6 border ${
              lastResult.success
                ? 'bg-[#0d3d0d] border-[#00cc00]'
                : 'bg-[#3d0d0d] border-[#cc0000]'
            }`}
          >
            {lastResult.success ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#00ff00]">✓ PASS VERIFIED</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#00cc00]">NAME</p>
                    <p className="text-white font-bold">{lastResult.data?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#00cc00]">EVENT</p>
                    <p className="text-white font-bold">{lastResult.data?.eventName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#00cc00]">COLLEGE</p>
                    <p className="text-white font-bold">{lastResult.data?.college}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#00cc00]">PHONE</p>
                    <p className="text-white font-bold">{lastResult.data?.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-[#ff0000]">✗ VERIFICATION FAILED</h3>
                <p className="text-[#ff0000] mt-2">{lastResult.error || lastResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
