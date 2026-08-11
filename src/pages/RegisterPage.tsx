import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuest } from '../components/flagship/quest-context';

export function RegisterPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { openQuest } = useQuest();
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      openQuest(eventId);
    } else {
      navigate('/register');
    }
  }, [eventId, openQuest, navigate]);

  return <div className="p-8 text-center text-sm font-bold uppercase">Redirecting to quest board…</div>;
}
