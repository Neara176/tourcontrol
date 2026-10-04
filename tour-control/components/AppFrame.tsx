'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AppFrame({ children }: { children: ReactNode }) {
  const { configured, loading, user, error } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!configured || loading) return;
    if (!user && !isLoginPage) router.replace('/login');
    if (user && isLoginPage) router.replace('/');
  }, [configured, loading, user, isLoginPage, router]);

  if (!configured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Connect Supabase</h1>
          <p>Set the two public Supabase project values in <code>tour-control/.env.local</code>, then restart the development server.</p>
          <ol>
            <li>Copy <code>.env.example</code> to <code>.env.local</code>.</li>
            <li>Set the Project URL and anon/publishable key from Supabase Project Settings → API.</li>
            <li>Run <code>supabase/schema.sql</code> in the Supabase SQL Editor and disable public sign-ups in Auth settings.</li>
          </ol>
          <p className="auth-note">Never use a service-role key in this browser app. Create your owner account in Supabase Auth before signing in.</p>
        </section>
      </main>
    );
  }

  if (loading || (!user && !isLoginPage) || (user && isLoginPage)) {
    return <div className="auth-loading" role="status">Checking secure sign-in…</div>;
  }

  if (isLoginPage) return <main className="auth-page">{children}</main>;

  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-main">
        {error && <p className="auth-error" role="alert">{error}</p>}
        {children}
      </main>
    </div>
  );
}
