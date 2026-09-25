import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Checking recovery link…");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error || !data.session) {
        setReady(false);
        setMessage("This recovery link is invalid or has expired. Request a new password recovery email and use the latest link once.");
        return;
      }
      setReady(true);
      setMessage("");
    };

    checkSession();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setMessage("");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMessage("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSuccess(true);
    setMessage("Password updated successfully. Taking you to Admin…");
    window.setTimeout(() => navigate({ to: "/admin" }), 900);
  }

  return (
    <main className="min-h-screen px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="text-sm text-muted-foreground">← Portfolio</Link>
        <div className="panel mt-8 p-7">
          <p className="eyebrow">Product Navigator</p>
          <h1 className="mt-3 text-3xl font-semibold">Set a new password</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Choose a new password for your portfolio admin account.
          </p>

          {ready && !success ? (
            <form onSubmit={updatePassword} className="mt-6 space-y-3">
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-border-strong"
              />
              <input
                required
                minLength={8}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-border-strong"
              />
              <button disabled={busy} className="btn-base btn-primary w-full" type="submit">
                {busy ? "Updating…" : "Set password"}
              </button>
            </form>
          ) : null}

          {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
