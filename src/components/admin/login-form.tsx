"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold text-white/65">Email address</span>
        <input name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-white/12 bg-black/20 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#d7ff5a]/70" placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-white/65">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-white/12 bg-black/20 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#d7ff5a]/70" placeholder="Your archive password" />
      </label>
      {state.error && <p className="rounded-xl border border-red-300/20 bg-red-300/8 px-4 py-3 text-sm text-red-100">{state.error}</p>}
      <button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-[#d7ff5a] px-5 text-sm font-bold text-[#0b0d0d] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Checking access…" : "Enter archive console"}
      </button>
    </form>
  );
}
