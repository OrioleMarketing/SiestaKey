import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Anchor, CheckCircle2, KeyRound, Mail, UserPlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/15";

type Mode = "login" | "register" | "magic";

function messageForError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loading, refresh } = useAuth();
  const initialMode: Mode = location === "/register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const queryError = useMemo(() => {
    if (typeof window === "undefined") return "";
    const value = new URLSearchParams(window.location.search).get("error");
    if (value === "invalid_or_expired") return "That sign-in link has expired or was already used. Request a new link below.";
    if (value === "verification_failed") return "We could not verify that sign-in link. Please request a new one.";
    return "";
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, navigate, user]);

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await refresh();
      navigate("/dashboard");
    },
    onError: value => setError(messageForError(value, "Invalid email or password.")),
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await refresh();
      navigate("/dashboard");
    },
    onError: value => setError(messageForError(value, "The account could not be created.")),
  });

  const requestMagicLink = trpc.auth.requestMagicLink.useMutation({
    onSuccess: () => setMagicLinkSent(true),
    onError: value => setError(messageForError(value, "The sign-in link could not be sent. Please try again shortly.")),
  });

  if (loading || user) return null;

  const pending = login.isPending || register.isPending || requestMagicLink.isPending;

  const selectMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setMagicLinkSent(false);
    if (nextMode === "register") navigate("/register", { replace: true });
    else navigate("/login", { replace: true });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "login") {
      await login.mutateAsync({ email, password, rememberMe }).catch(() => undefined);
      return;
    }
    if (mode === "register") {
      await register.mutateAsync({ name, email, password }).catch(() => undefined);
      return;
    }
    await requestMagicLink.mutateAsync({ email }).catch(() => undefined);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9f3f4,_#f8fbfb_45%,_#fff7e8)] px-4 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#123f4a] p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/15" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-amber-300/15" />
          <Link href="/" className="relative inline-flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e6a72f] text-[#123f4a]"><Anchor size={23} /></span>
            Shop in Siesta Key
          </Link>
          <div className="relative mt-20 max-w-sm">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">Business member access</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Manage your Siesta Key listing with confidence.</h1>
            <p className="mt-5 text-base leading-7 text-cyan-50/75">Sign in to update your business profile, photos, events, subscription, and local directory presence.</p>
            <div className="mt-10 space-y-4 text-sm text-cyan-50/85">
              {[
                "Password and passwordless sign-in options",
                "Secure, single-use email links",
                "Your existing listing and subscription stay connected",
              ].map(item => (
                <div key={item} className="flex items-center gap-3"><CheckCircle2 className="text-[#e6a72f]" size={18} />{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex rounded-2xl bg-slate-100 p-1.5 text-sm font-semibold">
              <button type="button" onClick={() => selectMode("login")} className={`flex-1 rounded-xl px-3 py-2.5 ${mode === "login" ? "bg-white text-[#123f4a] shadow-sm" : "text-slate-500"}`}>Sign in</button>
              <button type="button" onClick={() => selectMode("register")} className={`flex-1 rounded-xl px-3 py-2.5 ${mode === "register" ? "bg-white text-[#123f4a] shadow-sm" : "text-slate-500"}`}>Create account</button>
              <button type="button" onClick={() => selectMode("magic")} className={`flex-1 rounded-xl px-3 py-2.5 ${mode === "magic" ? "bg-white text-[#123f4a] shadow-sm" : "text-slate-500"}`}>Email link</button>
            </div>

            <div className="mb-7">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-800">
                {mode === "login" ? <KeyRound /> : mode === "register" ? <UserPlus /> : <Mail />}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Email me a sign-in link"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode === "login" ? "Use the email and password associated with your business account." : mode === "register" ? "Use a strong password of at least 12 characters." : "We'll send a one-time link that expires in 15 minutes."}
              </p>
            </div>

            {magicLinkSent ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                <CheckCircle2 className="mb-3" />
                <h3 className="font-bold">Check your email</h3>
                <p className="mt-2 text-sm leading-6">If an account exists for <strong>{email}</strong>, a secure sign-in link is on its way. Check your spam folder if it does not arrive shortly.</p>
                <button type="button" className="mt-5 text-sm font-bold text-emerald-800 underline" onClick={() => setMagicLinkSent(false)}>Send another link</button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={submit}>
                {mode === "register" && (
                  <label className="block text-sm font-semibold text-slate-700">Name
                    <input className={`${inputClass} mt-2`} value={name} onChange={event => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={180} required />
                  </label>
                )}
                <label className="block text-sm font-semibold text-slate-700">Email address
                  <input className={`${inputClass} mt-2`} type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" maxLength={320} required />
                </label>
                {mode !== "magic" && (
                  <label className="block text-sm font-semibold text-slate-700">Password
                    <input className={`${inputClass} mt-2`} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 12 : 1} maxLength={256} required />
                  </label>
                )}
                {mode === "login" && (
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />Keep me signed in for 30 days</label>
                )}
                {(error || queryError) && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || queryError}</div>}
                <button type="submit" disabled={pending} className="w-full rounded-xl bg-[#e6a72f] px-5 py-3.5 font-bold text-[#123f4a] transition hover:bg-[#efb845] disabled:cursor-not-allowed disabled:opacity-60">
                  {pending ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send secure link"}
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">By continuing, you agree to our <Link href="/terms" className="underline">Terms</Link> and acknowledge our <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
