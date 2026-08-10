import React from 'react';

const TEAL = "#12595B";
const INK = "#1A1A1A";

export function ContactPage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-16 pb-32 max-w-md mx-auto w-full min-h-screen">
      <div className="border-4 border-dashed p-6 text-center bg-white" style={{ borderColor: TEAL }}>
        <h2 className="font-hero text-2xl" style={{ color: TEAL }}>
          Enquiries
        </h2>
        <div className="mt-3 space-y-2 text-sm font-bold font-body" style={{ color: INK }}>
          <p>spectrumsbmp@gmail.com</p>
          <p>+91 98765 43210</p>
          <p className="mt-4 pt-4 border-t-2 border-dotted text-xs" style={{ borderColor: TEAL }}>
            SVKM's Shri Bhagubhai Mafatlal Polytechnic Vile Parle West, Mumbai, Maharashtra 400056
          </p>
        </div>
      </div>
    </div>
  );
}
