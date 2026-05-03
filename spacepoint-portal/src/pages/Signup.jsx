import { useState } from "react";
import { Link } from "react-router-dom";
import { signUp } from "../lib/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Account created!</h1>
          <p className="mt-3 text-slate-300">Account created! You can now sign in.</p>
          <Link className="mt-6 inline-block rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950" to="/login">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form className="w-full max-w-md space-y-5 rounded-lg border border-slate-800 bg-slate-900 p-8" onSubmit={handleSubmit}>
        <div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">Start your SpacePoint mission profile.</p>
        </div>
        {error && <p className="rounded-md bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Email</span>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-300"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Password</span>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-300"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button className="w-full rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-200" disabled={loading}>
          {loading ? "Creating..." : "Get Started"}
        </button>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link className="text-cyan-300" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
