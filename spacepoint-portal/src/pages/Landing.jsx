import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex items-center gap-3 text-cyan-300">
          <Rocket size={32} />
          <span className="text-sm font-semibold uppercase tracking-widest">SpacePoint Portal</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold sm:text-6xl">SpacePoint Portal</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            A role-based command center for instructors, ambassadors, interns, and admins.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="rounded-md border border-slate-600 px-5 py-3 font-semibold text-white hover:border-cyan-300"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
          <button
            className="rounded-md bg-cyan-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-200"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </section>
    </main>
  );
}
