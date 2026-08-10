import React from 'react';

const TEAL = "#12595B";
const INK = "#1A1A1A";

export function ContactPage() {
  return (
    <div className="">
      <div className="" style={{ borderColor: TEAL }}>
        <h2 className="" style={{ color: TEAL }}>
          Enquiries
        </h2>
        <div className="" style={{ color: INK }}>
          <p>spectrumsbmp@gmail.com</p>
          <p>+91 98765 43210</p>
          <p className="" style={{ borderColor: TEAL }}>
            SVKM's Shri Bhagubhai Mafatlal Polytechnic Vile Parle West, Mumbai, Maharashtra 400056
          </p>
        </div>
      </div>
    </div>
  );
}
