'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { client, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;
    setSubmitting(true);
    setError('');
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setSubmitting(false);
  };

  return (
    <section className="auth-card">
      <h1>Phnom Penh Tour Tracker</h1>
      <p>Sign in to securely access your tour bookings and reports.</p>
      <form className="auth-form" onSubmit={signIn}>
        <label>
          Email
          <input autoComplete="username" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} required />
        </label>
        {(error || authError) && <p className="auth-error" role="alert">{error || authError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-note">Create the owner account in Supabase Dashboard → Authentication → Users. Public sign-up is disabled.</p>
    </section>
  );
}
