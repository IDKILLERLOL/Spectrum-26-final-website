import React, { useState, useEffect } from 'react';
import { getPaymentDetails } from '../../../lib/firestore';
import { RegisterPaymentStepClient } from './RegisterPaymentStepClient';

export default function RegisterPaymentStep() {
  const [upiVpa, setUpiVpa] = useState('spectrum26@upi');

  useEffect(() => {
    getPaymentDetails()
      .then((details) => {
        if (details && details.upiId) setUpiVpa(details.upiId);
      })
      .catch(console.error);
  }, []);

  return <RegisterPaymentStepClient upiVpa={upiVpa} />;
}
