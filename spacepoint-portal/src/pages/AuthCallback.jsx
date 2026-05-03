import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function confirmAccount() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        navigate(`/login?error=${encodeURIComponent(error.message)}`, { replace: true });
        return;
      }

      if (data.session) {
        navigate("/onboarding", { replace: true });
        return;
      }

      navigate("/login?error=Unable%20to%20confirm%20account", { replace: true });
    }

    confirmAccount();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">Confirming your account...</h1>
      </div>
    </main>
  );
}
