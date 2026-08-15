"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[0.7rem] font-semibold tracking-wide uppercase text-white/50">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="h-12 w-full border border-white/10 bg-transparent px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[0.7rem] font-semibold tracking-wide uppercase text-white/50">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="h-12 w-full border border-white/10 bg-transparent px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white" placeholder="Your archive password" />
      </div>
      {state.error && <p className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{state.error}</p>}
      <button type="submit" disabled={pending} className="h-12 w-full bg-white px-5 text-sm font-semibold text-zinc-900 transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-60">
        {pending ? "Checking access…" : "Enter archive console"}
      </button>
    </form>
  );
}
