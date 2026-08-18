'use client';

import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { DEMO_AUTH_ACCOUNTS } from '../../lib/auth';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Avatar } from '../ui/avatar';
import { CheckIcon, ZapIcon } from '../icons';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, user, loginAsUser } = useUserStore();
  const [emailInput, setEmailInput] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' }),
      });
      const data = await res.json();
      if (data.user) {
        loginAsUser(data.user);
        setAuthModalOpen(false);
      }
    } catch {
      // Fallback auto login
      loginAsUser(DEMO_AUTH_ACCOUNTS[0]);
      setAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsLoading(true);
    try {
      await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'email', email: emailInput.trim() }),
      });
      setMagicLinkSent(true);
    } catch {
      setMagicLinkSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoUser = (account: typeof DEMO_AUTH_ACCOUNTS[0]) => {
    loginAsUser(account);
    setAuthModalOpen(false);
  };

  return (
    <Dialog
      open={authModalOpen}
      onClose={() => {
        setAuthModalOpen(false);
        setMagicLinkSent(false);
      }}
      title="Authentication & Account"
      description="NextAuth.js v5 (Auth.js) session manager with Google OAuth & Magic Link"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 py-1">
        {/* Active User Card */}
        <div className="flex items-center justify-between p-3.5 bg-hub-bg rounded-xl border border-hub-border">
          <div className="flex items-center gap-3">
            <Avatar initials={user.avatar} size="default" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-hub-text text-sm">{user.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-hub-accent/15 text-hub-accent-hi border border-hub-accent/30">
                  {user.plan} Plan
                </span>
              </div>
              <p className="text-hub-text-muted text-xs">{user.email}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-hub-text-muted block">Balance</span>
            <strong className="text-sm font-bold text-hub-accent font-mono">${user.creditsRemaining.toFixed(2)}</strong>
          </div>
        </div>

        {/* Google OAuth */}
        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-hub-border bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-hub-border" />
          <span className="text-[11px] text-hub-text-muted font-medium uppercase tracking-wider">or email magic link</span>
          <div className="flex-1 h-px bg-hub-border" />
        </div>

        {/* Magic Link Form */}
        {magicLinkSent ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
            <p className="text-xs text-emerald-400 font-semibold mb-1">✨ Magic link dispatched!</p>
            <p className="text-[11px] text-hub-text-sec">
              Check your inbox for a passwordless sign-in link. (Or use instant auto-login below).
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 h-10 px-3.5 rounded-xl bg-hub-bg border border-hub-border text-xs text-hub-text placeholder:text-hub-text-muted outline-none focus:border-hub-accent transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !emailInput.trim()}
              className="h-10 px-4 rounded-xl bg-hub-accent hover:bg-hub-accent-hi text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-sm"
            >
              Send Link
            </button>
          </form>
        )}

        {/* Auto-login / Account Switcher Demo Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-hub-text-muted uppercase tracking-wider">
              ⚡ Instant Auto-Login Demo Switcher
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              Zero-friction active
            </span>
          </div>

          <div className="space-y-2">
            {DEMO_AUTH_ACCOUNTS.map((acc) => {
              const isCurrent = acc.id === user.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => handleSelectDemoUser(acc)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left border transition-all ${
                    isCurrent
                      ? 'bg-hub-hover border-hub-accent shadow-sm'
                      : 'bg-hub-bg/60 border-hub-border/60 hover:border-hub-border hover:bg-hub-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar initials={acc.avatar} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs font-semibold text-hub-text truncate">{acc.name}</strong>
                        <span className="text-[10px] text-hub-text-muted font-normal truncate">({acc.email})</span>
                      </div>
                      <span className="text-[10.5px] text-hub-text-sec block truncate">{acc.roleDescription}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-hub-accent">${acc.creditsRemaining.toFixed(2)}</span>
                    {isCurrent && <CheckIcon size={14} className="text-hub-accent" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <DialogFooter>
        <button
          onClick={() => setAuthModalOpen(false)}
          className="border border-hub-border hover:bg-hub-hover text-hub-text rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
        >
          Done
        </button>
      </DialogFooter>
    </Dialog>
  );
}
